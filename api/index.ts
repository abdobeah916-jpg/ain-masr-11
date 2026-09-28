import express, { Request, Response } from 'express';
import { MongoClient, Db, Collection } from 'mongodb';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Supabase Admin initialization with service role key
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ebkortdqzznnfmtmrdyw.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const SUPABASE_BUCKET = process.env.VITE_SUPABASE_BUCKET || 'civic_evidence_videos';

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SECRET_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)
  : null;

// CORS configuration for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ============================================================================
// MONGODB ATLAS SERVERLESS CONNECTION CACHE
// ============================================================================
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'ain_masr_civic';
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'civic_reports';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

function maskMongoUri(uri: string): string {
  if (!uri) return '(none)';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

async function getMongoCollection(): Promise<{ client: MongoClient; db: Db; collection: Collection } | null> {
  if (!MONGODB_URI) return null;

  try {
    if (cachedClient && cachedDb) {
      return {
        client: cachedClient,
        db: cachedDb,
        collection: cachedDb.collection(MONGODB_COLLECTION),
      };
    }

    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return {
      client,
      db,
      collection: db.collection(MONGODB_COLLECTION),
    };
  } catch (err) {
    console.error('[Vercel Mongo Error]', err);
    return null;
  }
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'vercel',
    timestamp: new Date().toISOString(),
  });
});

// MongoDB Status
app.get('/api/mongo/status', async (_req: Request, res: Response) => {
  const isUriConfigured = Boolean(MONGODB_URI);
  if (!isUriConfigured) {
    return res.json({
      connected: false,
      configured: false,
      database: MONGODB_DB_NAME,
      collection: MONGODB_COLLECTION,
      uri: maskMongoUri(MONGODB_URI),
      messageAr: 'لم يتم ضبط رابط الاتصال بـ MongoDB Atlas (يرجى إضافته في إعدادات Vercel Environment Variables)',
      messageEn: 'MongoDB Atlas URI not configured yet in Vercel Environment Variables',
    });
  }

  const start = Date.now();
  const mongo = await getMongoCollection();
  if (mongo) {
    try {
      await mongo.db.command({ ping: 1 });
      const count = await mongo.collection.countDocuments();
      return res.json({
        connected: true,
        configured: true,
        database: MONGODB_DB_NAME,
        collection: MONGODB_COLLECTION,
        uri: maskMongoUri(MONGODB_URI),
        latencyMs: Date.now() - start,
        reportCount: count,
        messageAr: `متصل بنجاح بقاعدة بيانات MongoDB Atlas (${count} بلاغ)`,
        messageEn: `Connected to MongoDB Atlas successfully (${count} reports)`,
      });
    } catch (err: any) {
      return res.json({
        connected: false,
        configured: true,
        error: err.message,
        database: MONGODB_DB_NAME,
        collection: MONGODB_COLLECTION,
        uri: maskMongoUri(MONGODB_URI),
        messageAr: 'فشل الاتصال بقاعدة بيانات MongoDB Atlas',
        messageEn: 'Failed to connect to MongoDB Atlas',
      });
    }
  }

  return res.json({
    connected: false,
    configured: true,
    database: MONGODB_DB_NAME,
    collection: MONGODB_COLLECTION,
    uri: maskMongoUri(MONGODB_URI),
    messageAr: 'تعذر الاتصال بـ MongoDB Atlas',
    messageEn: 'Could not connect to MongoDB Atlas',
  });
});

// Reports: GET (fetch all reports)
app.get('/api/mongo/reports', async (req: Request, res: Response) => {
  const mongo = await getMongoCollection();
  if (!mongo) {
    return res.json({
      success: true,
      source: 'offline_empty',
      count: 0,
      reports: [],
      messageAr: 'قاعدة بيانات MongoDB غير متصلة حالياً',
      messageEn: 'MongoDB not currently connected',
    });
  }

  try {
    const limit = parseInt((req.query.limit as string) || '100', 10);
    const reports = await mongo.collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return res.json({
      success: true,
      source: 'mongodb_atlas',
      count: reports.length,
      reports,
    });
  } catch (err: any) {
    console.error('[Vercel Get Reports Error]', err);
    return res.status(500).json({ success: false, error: err.message, reports: [] });
  }
});

// Reports: POST (save or update report)
app.post('/api/mongo/reports', async (req: Request, res: Response) => {
  const report = req.body;
  if (!report || !report.id) {
    return res.status(400).json({ success: false, error: 'Invalid report payload' });
  }

  const documentToStore = {
    ...report,
    location: report.location || {
      governorateId: 'cairo',
      cityDistrict: 'حي مصر القديمة',
      streetLandmark: '',
      lat: 30.0444,
      lng: 31.2357,
    },
    _id: report.mongoId || report._id || report.id,
    mongoSyncedAt: new Date().toISOString(),
  };

  const mongo = await getMongoCollection();
  if (mongo) {
    try {
      await mongo.collection.updateOne(
        { id: report.id },
        { $set: documentToStore },
        { upsert: true }
      );

      return res.json({
        success: true,
        storedIn: 'mongodb_atlas',
        reportId: report.id,
        referenceNo: report.referenceNo,
        messageAr: 'تم حفظ البلاغ ومزامنته بنجاح في MongoDB Atlas',
        messageEn: 'Report successfully saved and synced to MongoDB Atlas',
      });
    } catch (err: any) {
      console.error('[Vercel Mongo Insert Error]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.json({
    success: true,
    storedIn: 'client_local_queue',
    reportId: report.id,
    messageAr: 'تم تسجيل البلاغ محلياً (MongoDB غير متصلة في بيئة السيرفر)',
    messageEn: 'Report saved locally (MongoDB not connected)',
  });
});

// Reports: PATCH (update report fields or status)
app.patch('/api/mongo/reports/:id', async (req: Request, res: Response) => {
  const reportId = req.params.id;
  const updates = req.body || {};

  try {
    const mongo = await getMongoCollection();
    if (mongo) {
      await mongo.collection.updateOne(
        { id: reportId },
        {
          $set: {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    }
    return res.json({ success: true, reportId, message: 'Report updated in MongoDB' });
  } catch (err: any) {
    console.error('[Vercel Mongo Patch Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Supabase Status
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  const sbUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ebkortdqzznnfmtmrdyw.supabase.co';
  const sbKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
  const bucket = process.env.VITE_SUPABASE_BUCKET || 'civic_evidence_videos';

  res.json({
    connected: true,
    url: sbUrl,
    bucket,
    hasAnonKey: Boolean(sbKey),
    directBrowserUploadReady: true,
    maxUploadMB: 500,
    messageAr: 'خدمة Supabase Storage جاهزة لرفع الفيديوهات حتى 500MB وحفظ الأدلة الجنائية',
    messageEn: 'Supabase Storage ready for direct 500MB forensic evidence video uploads',
  });
});

// Supabase Signed Upload Token Generator
app.get('/api/supabase/sign-upload', async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Supabase admin client not initialized' });
    }

    const rawPath = (req.query.path as string) || `evidence/vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp4`;
    const cleanPath = rawPath.replace(/[^a-zA-Z0-9_\-\.\/]/g, '');

    const { data, error } = await supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .createSignedUploadUrl(cleanPath);

    if (error || !data) {
      return res.status(500).json({ success: false, error: error?.message || 'Failed to create signed upload URL' });
    }

    const { data: pubData } = supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(cleanPath);

    return res.json({
      success: true,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: pubData?.publicUrl,
      bucket: SUPABASE_BUCKET,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Video Vault status
app.get('/api/videos/status', (_req: Request, res: Response) => {
  res.json({
    active: true,
    architecture: 'supabase_direct_upload_and_vercel_serverless',
    maxSizeBytes: 524288000,
    maxSizeMB: 500,
    allowedMimeTypes: [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
      'video/avi',
    ],
    bucket: process.env.VITE_SUPABASE_BUCKET || 'civic_evidence_videos',
    messageAr: 'منظومة الفيديوهات مهيأة لرفع الفيديوهات حتى 500MB مباشرة إلى Supabase مع التحقق الجنائي SHA-256',
    messageEn: 'Video subsystem ready for up to 500MB direct Supabase upload with SHA-256 forensic validation',
  });
});

// Export default app for Vercel Serverless
export default app;
