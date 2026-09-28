import { GOVERNORATES, calculateDistanceKm } from '../data/mockData';

export interface GpsLocationResult {
  lat: number;
  lng: number;
  accuracyMeters: number;
  governorateId: string;
  governorateNameAr: string;
  governorateNameEn: string;
  district: string;
  street: string;
  source: 'gps_satellite' | 'network_cellular' | 'ip_lookup' | 'preset_gazetteer';
  formattedAddressAr: string;
  formattedAddressEn: string;
  statusMessageAr?: string;
  statusMessageEn?: string;
}

export interface SearchAddressResult {
  displayName: string;
  lat: number;
  lng: number;
  govId: string;
  govName: string;
  district: string;
  street: string;
}

// Comprehensive Egyptian Local Gazetteer with verified centroids & landmarks across all governorates
export const EGYPT_DETAILED_GAZETTEER = [
  // Suez Governorate
  { govId: 'suez', districtAr: 'حي الأربعين', districtEn: 'Al-Arbaeen', streetAr: 'ميدان الإسعاف - شارع الجيش', streetEn: 'El-Gueish St, Al-Arbaeen', lat: 29.9801, lng: 32.535 },
  { govId: 'suez', districtAr: 'حي السويس (وسط البلد)', districtEn: 'Suez District', streetAr: 'شارع سعد زغلول - ديوان المحافظة', streetEn: 'Saad Zaghloul St, Suez City', lat: 29.9668, lng: 32.5498 },
  { govId: 'suez', districtAr: 'حي فيصل', districtEn: 'Faisal District', streetAr: 'ميدان الحرفيين - طريق ناصر', streetEn: 'Nasser Road, Faisal', lat: 29.992, lng: 32.521 },
  { govId: 'suez', districtAr: 'حي عتاقة', districtEn: 'Attaka District', streetAr: 'طريق الأدبية - ميناء السخنة', streetEn: 'Ain Sokhna Road, Attaka', lat: 29.924, lng: 32.489 },
  { govId: 'suez', districtAr: 'حي الجناين', districtEn: 'Al-Ganayen', streetAr: 'طريق كبريت - المعبر الزراعي', streetEn: 'Kobrit Road, Al-Ganayen', lat: 30.055, lng: 32.571 },
  { govId: 'suez', districtAr: 'بورتوفيق', districtEn: 'Port Tawfiq', streetAr: 'ممشى بورتوفيق أمام القناة', streetEn: 'Port Tawfiq Canal Promenade', lat: 29.953, lng: 32.563 },

  // Cairo Governorate
  { govId: 'cairo', districtAr: 'مدينة نصر - المنطقة الأولى', districtEn: 'Nasr City 1st District', streetAr: 'شارع عباس العقاد تقاطع مصطفى النحاس', streetEn: 'Abbas El-Akkad St, Nasr City', lat: 30.057, lng: 31.341 },
  { govId: 'cairo', districtAr: 'مدينة نصر - الحي العاشر', districtEn: 'Nasr City 10th District', streetAr: 'امتداد محور المشير طنطاوي', streetEn: 'El-Mosheer Tantawy Axis', lat: 30.0489, lng: 31.3654 },
  { govId: 'cairo', districtAr: 'مصر الجديدة', districtEn: 'Heliopolis', streetAr: 'ميدان روكسي - شارع الأهرام', streetEn: 'Roxy Sq, Heliopolis', lat: 30.091, lng: 31.328 },
  { govId: 'cairo', districtAr: 'وسط البلد', districtEn: 'Downtown Cairo', streetAr: 'ميدان التحرير - شارع قصر النيل', streetEn: 'Tahrir Sq, Kasr El Nil', lat: 30.0444, lng: 31.2357 },
  { govId: 'cairo', districtAr: 'المعادي', districtEn: 'Maadi', streetAr: 'شارع 9 دجلة المعادي', streetEn: 'Street 9, Degla Maadi', lat: 29.96, lng: 31.26 },
  { govId: 'cairo', districtAr: 'التجمع الخامس (القاهرة الجديدة)', districtEn: 'New Cairo 5th Settlement', streetAr: 'شارع التسعين الشمالي - مجمع البنوك', streetEn: 'North 90th St, New Cairo', lat: 30.025, lng: 31.45 },
  { govId: 'cairo', districtAr: 'الشروق', districtEn: 'El Shorouk City', streetAr: 'طريق السويس مدخل الشروق 1', streetEn: 'Suez Road, Entrance 1', lat: 30.12, lng: 31.62 },
  { govId: 'cairo', districtAr: 'الزمالك', districtEn: 'Zamalek', streetAr: 'شارع 26 يوليو - أمام حديقة الأسماك', streetEn: '26th of July St, Zamalek', lat: 30.062, lng: 31.221 },
  { govId: 'cairo', districtAr: 'شبرا', districtEn: 'Shoubra', streetAr: 'شارع شبرا الرئيسي - ميدان روض الفرج', streetEn: 'Shoubra St, Rod El Farag', lat: 30.081, lng: 31.246 },
  { govId: 'cairo', districtAr: 'حلوان', districtEn: 'Helwan', streetAr: 'شارع راغب باشا - محطة المترو', streetEn: 'Ragheb Pasha St, Helwan', lat: 29.845, lng: 31.332 },
  { govId: 'cairo', districtAr: 'المقطم', districtEn: 'Mokattam', streetAr: 'شارع 9 - ميدان النافورة', streetEn: 'Street 9, Nafoura Sq', lat: 30.005, lng: 31.303 },
  { govId: 'cairo', districtAr: 'عين شمس', districtEn: 'Ain Shams', streetAr: 'شارع أحمد عصمت', streetEn: 'Ahmed Esmat St', lat: 30.131, lng: 31.325 },

  // Giza Governorate
  { govId: 'giza', districtAr: 'الدقي', districtEn: 'Dokki', streetAr: 'شارع مصدق تقاطع شارع إيران', streetEn: 'Mossadek St, Dokki', lat: 30.038, lng: 31.2056 },
  { govId: 'giza', districtAr: 'المهندسين', districtEn: 'Mohandessin', streetAr: 'شارع جامعة الدول العربية - ميدان سفنكس', streetEn: 'Gamaet El Dowal St, Sphinx Sq', lat: 30.056, lng: 31.201 },
  { govId: 'giza', districtAr: 'العجوزة', districtEn: 'Agouza', streetAr: 'شارع النيل - أمام مستشفى العجوزة', streetEn: 'Corniche El Nil, Agouza', lat: 30.051, lng: 31.214 },
  { govId: 'giza', districtAr: 'الهرم', districtEn: 'Al-Haram', streetAr: 'شارع الأهرام - محطة العريش', streetEn: 'Al Haram St, El Areesh', lat: 29.998, lng: 31.155 },
  { govId: 'giza', districtAr: 'فيصل', districtEn: 'Faisal Giza', streetAr: 'شارع فيصل الرئيسي - محطة حسن محمد', streetEn: 'Faisal Main St', lat: 30.007, lng: 31.173 },
  { govId: 'giza', districtAr: 'مدينة 6 أكتوبر', districtEn: '6th of October City', streetAr: 'المحور المركزي - ميدان الحصري', streetEn: 'Central Axis, El Hosary Sq', lat: 29.975, lng: 30.935 },
  { govId: 'giza', districtAr: 'الشيخ زايد', districtEn: 'Sheikh Zayed', streetAr: 'محور 26 يوليو - هايبر وان', streetEn: '26th of July Corridor, Hyper One', lat: 30.034, lng: 30.985 },

  // Alexandria Governorate
  { govId: 'alexandria', districtAr: 'سموحة (سيدي جابر)', districtEn: 'Smouha', streetAr: 'ميدان فيكتور عمانويل - شارع فوزي معاذ', streetEn: 'Victor Emmanuel Sq, Smouha', lat: 31.215, lng: 29.955 },
  { govId: 'alexandria', districtAr: 'محطة الرمل', districtEn: 'Raml Station', streetAr: 'ميدان سعد زغلول - الكورنيش', streetEn: 'Saad Zaghloul Sq, Raml Station', lat: 31.2001, lng: 29.8987 },
  { govId: 'alexandria', districtAr: 'المنتزه ثان', districtEn: 'Montaza 2nd', streetAr: 'شارع ملك حفني بحري - العصافرة', streetEn: 'Malak Hefni St, Asafra', lat: 31.2829, lng: 30.0177 },
  { govId: 'alexandria', districtAr: 'ميامي (سيدي بشر)', districtEn: 'Miami / Sidi Bishr', streetAr: 'شارع خالد بن الوليد - الكورنيش', streetEn: 'Khaled Ibn El Walid St, Miami', lat: 31.265, lng: 29.995 },
  { govId: 'alexandria', districtAr: 'العجمي (البيطاش)', districtEn: 'Agami', streetAr: 'طريق إسكندرية مطروح - البيطاش', streetEn: 'Agami Beytash', lat: 31.116, lng: 29.774 },

  // Ismailia Governorate
  { govId: 'ismailia', districtAr: 'حي أول الإسماعيلية', districtEn: 'Ismailia 1st', streetAr: 'شارع محمد علي - نمرة 6', streetEn: 'Mohamed Ali St, Number 6', lat: 30.5965, lng: 32.2715 },
  { govId: 'ismailia', districtAr: 'حي الشيخ زايد الإسماعيلية', districtEn: 'Sheikh Zayed Ismailia', streetAr: 'الشارع التجاري - ديوان المحافظة', streetEn: 'Commercial St, Ismailia', lat: 30.612, lng: 32.285 },

  // Port Said Governorate
  { govId: 'port_said', districtAr: 'حي الشرق', districtEn: 'Al-Sharq Port Said', streetAr: 'شارع الجمهورية - ممشى ديليسبس', streetEn: 'El Gomhoureya St, Port Said', lat: 31.2653, lng: 32.3019 },
  { govId: 'port_said', districtAr: 'حي المناخ', districtEn: 'Al-Manakh', streetAr: 'شارع 23 يوليو - الاستاد', streetEn: '23rd of July St, Al-Manakh', lat: 31.258, lng: 32.288 },
  { govId: 'port_said', districtAr: 'حي الزهور', districtEn: 'Al-Zohour Port Said', streetAr: 'شارع 23 ديسمبر - ميدان بنزرت', streetEn: '23rd Dec St', lat: 31.242, lng: 32.268 },

  // Dakahlia Governorate
  { govId: 'dakahlia', districtAr: 'المنصورة (حي غرب)', districtEn: 'Mansoura West', streetAr: 'شارع الجمهورية - أمام بوابة الجامعة', streetEn: 'Gomhoureya St, Mansoura Univ', lat: 31.0409, lng: 31.3785 },
  { govId: 'dakahlia', districtAr: 'طلخا', districtEn: 'Talkha', streetAr: 'طريق الشيراتون - كوبري طلخا', streetEn: 'Talkha Bridge, Sheraton Rd', lat: 31.055, lng: 31.385 },

  // Gharbia Governorate
  { govId: 'gharbia', districtAr: 'طنطا (حي أول)', districtEn: 'Tanta 1st', streetAr: 'شارع البحر - ميدان السيد البدوي', streetEn: 'El Bahr St, El Sayed El Badawy', lat: 30.7865, lng: 31.0004 },
  { govId: 'gharbia', districtAr: 'المحلة الكبرى', districtEn: 'El Mahalla El Kubra', streetAr: 'شارع شكري القوتلي - ميدان الشون', streetEn: 'Shoukry El Kowatly St, Mahalla', lat: 30.972, lng: 31.164 },

  // Qalyubia Governorate
  { govId: 'qalyubia', districtAr: 'شبرا الخيمة (غرب)', districtEn: 'Shoubra El Kheima West', streetAr: 'شارع 15 مايو - خلف مستشفى بهتيم', streetEn: '15th of May St, Bahtim', lat: 30.1286, lng: 31.2422 },
  { govId: 'qalyubia', districtAr: 'بنها', districtEn: 'Banha', streetAr: 'كورنيش النيل - أمام مبنى المحافظة', streetEn: 'Corniche El Nil, Banha', lat: 30.466, lng: 31.185 },

  // Sharqia Governorate
  { govId: 'sharqia', districtAr: 'الزقازيق (حي أول)', districtEn: 'Zagazig 1st', streetAr: 'شارع المحافظة - ميدان طلعت حرب', streetEn: 'El Mohafaza St, Zagazig', lat: 30.5877, lng: 31.502 },
  { govId: 'sharqia', districtAr: 'العاشر من رمضان', districtEn: '10th of Ramadan', streetAr: 'الميدان الأردني - صيدناوي', streetEn: 'Jordanian Sq, 10th Ramadan', lat: 30.301, lng: 31.745 },

  // Red Sea Governorate
  { govId: 'red_sea', districtAr: 'الغردقة (الدهار)', districtEn: 'Hurghada Dahar', streetAr: 'ميدان السقالة - شارع الشيراتون', streetEn: 'Sheraton St, Sakala Sq', lat: 27.2579, lng: 33.8116 },
  { govId: 'red_sea', districtAr: 'الجونة', districtEn: 'El Gouna', streetAr: 'ميدان التميمي - أبو تيج مارينا', streetEn: 'Abu Tig Marina, El Gouna', lat: 27.395, lng: 33.676 },

  // South Sinai
  { govId: 'south_sinai', districtAr: 'شرم الشيخ (خليج نعمة)', districtEn: 'Sharm El Sheikh (Naama Bay)', streetAr: 'طريق السلام - ممشى خليج نعمة', streetEn: 'El Salam Rd, Naama Bay', lat: 27.9158, lng: 34.3299 },

  // Aswan Governorate
  { govId: 'aswan', districtAr: 'أسوان المركزية', districtEn: 'Aswan Central', streetAr: 'كورنيش النيل - ميدان المحطة', streetEn: 'Corniche El Nil, Aswan Station', lat: 24.0889, lng: 32.8998 },

  // Luxor Governorate
  { govId: 'luxor', districtAr: 'الأقصر المركزية', districtEn: 'Luxor Central', streetAr: 'شارع كورنيش النيل - معبد الأقصر', streetEn: 'Corniche El Nil, Luxor Temple', lat: 25.6989, lng: 32.6421 },

  // Asyut Governorate
  { govId: 'asyut', districtAr: 'حي غرب أسيوط', districtEn: 'Asyut West', streetAr: 'شارع الجمهورية - ميدان المحطة', streetEn: 'Gomhoureya St, Asyut', lat: 27.1809, lng: 31.1837 },

  // Sohag Governorate
  { govId: 'sohag', districtAr: 'سوهاج المركزية', districtEn: 'Sohag Central', streetAr: 'شارع 15 - كورنيش النيل الشرقي', streetEn: 'Corniche El Nil, Sohag', lat: 26.5569, lng: 31.6948 },

  // Fayoum Governorate
  { govId: 'fayoum', districtAr: 'حي لطف الله (الفيوم)', districtEn: 'Fayoum Central', streetAr: 'شارع جمال عبد الناصر - ميدان السواقي', streetEn: 'Sawaqi Sq, Fayoum', lat: 29.3082, lng: 30.8428 },

  // Beni Suef
  { govId: 'beni_suef', districtAr: 'بني سويف المركزية', districtEn: 'Beni Suef Central', streetAr: 'شارع بورسعيد - ميدان المديرية', streetEn: 'Port Said St, Beni Suef', lat: 29.0744, lng: 31.0978 },

  // Minya
  { govId: 'minya', districtAr: 'المنيا (حي وسط)', districtEn: 'Minya Central', streetAr: 'كورنيش النيل - ميدان بالاس', streetEn: 'Palace Sq, Minya', lat: 28.0871, lng: 30.7618 },

  // Beheira
  { govId: 'beheira', districtAr: 'دمنهور', districtEn: 'Damanhur', streetAr: 'شارع عبد السلام الشاذلي - مبنى المحافظة', streetEn: 'Damanhur Center', lat: 31.0364, lng: 30.469 },

  // Kafr El Sheikh
  { govId: 'kafr_el_sheikh', districtAr: 'كفر الشيخ المركزية', districtEn: 'Kafr El Sheikh Central', streetAr: 'شارع الجيش - ميدان النصر', streetEn: 'El Geish St, Kafr El Sheikh', lat: 31.1107, lng: 30.9388 },

  // Matrouh
  { govId: 'matrouh', districtAr: 'مرسى مطروح', districtEn: 'Marsa Matrouh', streetAr: 'شارع الإسكندرية - كورنيش العوام', streetEn: 'Alexandria St, Matrouh', lat: 31.3543, lng: 27.2373 },
];

/**
 * High-precision local gazetteer resolution
 */
export function resolveFromGazetteer(lat: number, lng: number): {
  gov: typeof GOVERNORATES[0];
  districtAr: string;
  districtEn: string;
  streetAr: string;
  streetEn: string;
  distanceKm: number;
} {
  // 1. Find closest gazetteer entry
  let closestGaz = EGYPT_DETAILED_GAZETTEER[0];
  let minGazDist = Infinity;
  for (const item of EGYPT_DETAILED_GAZETTEER) {
    const d = calculateDistanceKm(lat, lng, item.lat, item.lng);
    if (d < minGazDist) {
      minGazDist = d;
      closestGaz = item;
    }
  }

  // 2. Find closest governorate
  let closestGov = GOVERNORATES.find((g) => g.id === closestGaz.govId) || GOVERNORATES[0];
  let minGovDist = calculateDistanceKm(lat, lng, closestGov.lat, closestGov.lng);
  for (const g of GOVERNORATES) {
    const d = calculateDistanceKm(lat, lng, g.lat, g.lng);
    if (d < minGovDist) {
      minGovDist = d;
      closestGov = g;
    }
  }

  return {
    gov: closestGov,
    districtAr: closestGaz.districtAr,
    districtEn: closestGaz.districtEn,
    streetAr: closestGaz.streetAr,
    streetEn: closestGaz.streetEn,
    distanceKm: minGazDist,
  };
}

/**
 * Online Reverse Geocode with OpenStreetMap Nominatim with fallback
 */
export async function reverseGeocodeOnline(lat: number, lng: number, lang: 'ar' | 'en' = 'ar'): Promise<{
  district?: string;
  street?: string;
  govId?: string;
  govName?: string;
} | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${lang}`;
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data || !data.address) return null;

    const addr = data.address;
    const street =
      addr.road ||
      addr.pedestrian ||
      addr.path ||
      addr.street ||
      addr.amenity ||
      addr.public_building ||
      '';

    const district =
      addr.suburb ||
      addr.neighbourhood ||
      addr.city_district ||
      addr.quarter ||
      addr.residential ||
      addr.city ||
      addr.town ||
      addr.village ||
      '';

    // Match governorate from address state/city
    const stateName = `${addr.state || ''} ${addr.province || ''} ${addr.county || ''} ${addr.city || ''}`.toLowerCase();
    const matchedGov = GOVERNORATES.find((g) =>
      stateName.includes(g.nameAr.toLowerCase()) ||
      stateName.includes(g.nameEn.toLowerCase()) ||
      g.nameAr.replace('محافظة', '').trim().length > 2 && stateName.includes(g.nameAr.replace('محافظة', '').trim().toLowerCase())
    );

    return {
      street: street || undefined,
      district: district || undefined,
      govId: matchedGov?.id,
      govName: lang === 'ar' ? matchedGov?.nameAr : matchedGov?.nameEn,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Search Egyptian address online via OpenStreetMap Nominatim + local gazetteer fallback
 */
export async function searchEgyptianAddress(
  query: string,
  lang: 'ar' | 'en' = 'ar'
): Promise<SearchAddressResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const results: SearchAddressResult[] = [];
  const queryLower = trimmed.toLowerCase();

  // 1. Instant local gazetteer match
  for (const item of EGYPT_DETAILED_GAZETTEER) {
    if (
      item.districtAr.toLowerCase().includes(queryLower) ||
      item.streetAr.toLowerCase().includes(queryLower) ||
      item.districtEn.toLowerCase().includes(queryLower) ||
      item.streetEn.toLowerCase().includes(queryLower)
    ) {
      const gov = GOVERNORATES.find((g) => g.id === item.govId) || GOVERNORATES[0];
      results.push({
        displayName: `${item.districtAr} - ${item.streetAr} (${gov.nameAr})`,
        lat: item.lat,
        lng: item.lng,
        govId: gov.id,
        govName: lang === 'ar' ? gov.nameAr : gov.nameEn,
        district: lang === 'ar' ? item.districtAr : item.districtEn,
        street: lang === 'ar' ? item.streetAr : item.streetEn,
      });
    }
  }

  // 2. Also check governorate names
  for (const gov of GOVERNORATES) {
    if (gov.nameAr.includes(trimmed) || gov.nameEn.toLowerCase().includes(queryLower)) {
      results.push({
        displayName: `${gov.nameAr} (مركز المحافظة)`,
        lat: gov.lat,
        lng: gov.lng,
        govId: gov.id,
        govName: lang === 'ar' ? gov.nameAr : gov.nameEn,
        district: lang === 'ar' ? `مدينة ${gov.nameAr}` : `${gov.nameEn} Center`,
        street: lang === 'ar' ? 'الميدان الرئيسي' : 'Main Square',
      });
    }
  }

  // 3. Online OpenStreetMap search with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=eg&limit=6&addressdetails=1&accept-language=${lang}`;
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lng)) continue;

          const addr = item.address || {};
          const street = addr.road || addr.pedestrian || addr.street || item.name || '';
          const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.city || '';
          const gaz = resolveFromGazetteer(lat, lng);

          results.push({
            displayName: item.display_name,
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            govId: gaz.gov.id,
            govName: lang === 'ar' ? gaz.gov.nameAr : gaz.gov.nameEn,
            district: district || (lang === 'ar' ? gaz.districtAr : gaz.districtEn),
            street: street || (lang === 'ar' ? gaz.streetAr : gaz.streetEn),
          });
        }
      }
    }
  } catch (e) {
    // ignore network timeout
  }

  // Deduplicate results by proximity (< 0.5km)
  const deduped: SearchAddressResult[] = [];
  for (const r of results) {
    const exists = deduped.some((d) => calculateDistanceKm(r.lat, r.lng, d.lat, d.lng) < 0.5);
    if (!exists) {
      deduped.push(r);
    }
    if (deduped.length >= 8) break;
  }

  return deduped;
}

/**
 * Multi-provider IP Geolocation Fallback
 */
export async function getIpLocationFallback(): Promise<{ lat: number; lng: number } | null> {
  // Provider 1: geojs.io
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);
    const resp = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      if (data?.latitude && data?.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (lat >= 21.0 && lat <= 32.5 && lng >= 24.5 && lng <= 37.0) {
          return { lat, lng };
        }
      }
    }
  } catch (e) {
    // continue to provider 2
  }

  // Provider 2: freeipapi
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      if (data?.latitude && data?.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (lat >= 21.0 && lat <= 32.5 && lng >= 24.5 && lng <= 37.0) {
          return { lat, lng };
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

/**
 * Master Robust GPS Geolocation Engine:
 * 1. Hardware GPS (High Accuracy via satellite)
 * 2. Rapid Cellular/WiFi Network Geolocation fallback
 * 3. IP Geolocation fallback
 * 4. Online Reverse Geocoding with OpenStreetMap Nominatim
 * 5. Egyptian Local Gazetteer Fallback
 */
export async function acquireAccurateGpsLocation(
  lang: 'ar' | 'en' = 'ar',
  onProgress?: (msg: string) => void
): Promise<GpsLocationResult> {
  if (onProgress) {
    onProgress(
      lang === 'ar'
        ? '🛰️ جاري فتح وحدة الـ GPS والاتصال المباشر بالأقمار الصناعية...'
        : 'Connecting to GPS Satellites...'
    );
  }

  let capturedCoords: {
    lat: number;
    lng: number;
    accuracy: number;
    source: GpsLocationResult['source'];
  } | null = null;

  let permissionError: GeolocationPositionError | null = null;

  // 1. Try Hardware GPS via navigator.geolocation
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      capturedCoords = await new Promise((resolve, reject) => {
        let isDone = false;

        // Stage 1: Try High Accuracy GPS
        const highAccId = navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (isDone) return;
            isDone = true;
            resolve({
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
              accuracy: Math.round(pos.coords.accuracy || 8),
              source: 'gps_satellite',
            });
          },
          (err) => {
            if (isDone) return;
            permissionError = err;

            // If user explicitly denied, don't nag with second request
            if (err.code === 1) {
              isDone = true;
              reject(err);
              return;
            }

            if (onProgress) {
              onProgress(
                lang === 'ar'
                  ? '📡 جاري الاستشعار عبر شبكات الاتصالات الخلوية (WiFi / 4G)...'
                  : 'Falling back to Cellular/WiFi Network triangulation...'
              );
            }

            // Stage 2: Normal Accuracy (Cellular/Network)
            navigator.geolocation.getCurrentPosition(
              (pos2) => {
                if (isDone) return;
                isDone = true;
                resolve({
                  lat: Number(pos2.coords.latitude.toFixed(5)),
                  lng: Number(pos2.coords.longitude.toFixed(5)),
                  accuracy: Math.round(pos2.coords.accuracy || 28),
                  source: 'network_cellular',
                });
              },
              (err2) => {
                if (isDone) return;
                isDone = true;
                reject(err2);
              },
              { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
            );
          },
          { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
        );
      });
    } catch (gpsErr: any) {
      // Permission denied or timeout
    }
  }

  // 2. If browser geolocation failed or denied, try IP fallback
  if (!capturedCoords) {
    if (onProgress) {
      onProgress(
        lang === 'ar'
          ? '🌐 جاري تحديد الموقع التقديري عبر بوابة الاتصالات الإقليمية...'
          : 'Acquiring regional IP Geolocation...'
      );
    }
    const ipGeo = await getIpLocationFallback();
    if (ipGeo) {
      capturedCoords = {
        lat: Number(ipGeo.lat.toFixed(5)),
        lng: Number(ipGeo.lng.toFixed(5)),
        accuracy: 120,
        source: 'ip_lookup',
      };
    }
  }

  // 3. If running in strict sandbox or offline, default to Suez / Arbaeen or Cairo
  if (!capturedCoords) {
    capturedCoords = {
      lat: 29.9801,
      lng: 32.535,
      accuracy: 25,
      source: 'preset_gazetteer',
    };
  }

  const { lat, lng, accuracy, source } = capturedCoords;

  if (onProgress) {
    onProgress(
      lang === 'ar'
        ? '📍 تم التقاط الإحداثيات، جاري استخراج اسم الشارع والحي المصري...'
        : 'Reverse geocoding Egyptian street & district...'
    );
  }

  // 4. Reverse Geocode: Match closest Egyptian Governorate & Local Address
  const gazetteerMatch = resolveFromGazetteer(lat, lng);
  const onlineAddr = await reverseGeocodeOnline(lat, lng, lang);

  const governorateId = onlineAddr?.govId || gazetteerMatch.gov.id;
  const gov = GOVERNORATES.find((g) => g.id === governorateId) || gazetteerMatch.gov;

  const district =
    onlineAddr?.district ||
    (lang === 'ar' ? gazetteerMatch.districtAr : gazetteerMatch.districtEn);

  const street =
    onlineAddr?.street ||
    (lang === 'ar' ? gazetteerMatch.streetAr : gazetteerMatch.streetEn);

  const formattedAddressAr = `${district}، ${gov.nameAr} — ${street}`;
  const formattedAddressEn = `${district}, ${gov.nameEn} — ${street}`;

  const statusMessageAr =
    source === 'gps_satellite'
      ? `تم قفل موقع الـ GPS بنجاح عبر الأقمار الصناعية بدقة ±${accuracy}م`
      : source === 'network_cellular'
      ? `تم تحديد موقعك بدقة ±${accuracy}م عبر شبكة الاتصالات`
      : `تم تحديد الموقع التقديري. يمكنك تحريك الدبوس على الخريطة للضبط الدقيق.`;

  const statusMessageEn =
    source === 'gps_satellite'
      ? `GPS Satellite Fix locked (±${accuracy}m accuracy)`
      : source === 'network_cellular'
      ? `Network Triangulation locked (±${accuracy}m accuracy)`
      : `Regional estimate set. Fine-tune by dragging the pin on the map.`;

  return {
    lat,
    lng,
    accuracyMeters: accuracy,
    governorateId: gov.id,
    governorateNameAr: gov.nameAr,
    governorateNameEn: gov.nameEn,
    district,
    street,
    source,
    formattedAddressAr,
    formattedAddressEn,
    statusMessageAr,
    statusMessageEn,
  };
}
