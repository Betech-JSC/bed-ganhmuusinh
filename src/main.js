import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/main.css';
import maplibregl from 'maplibre-gl';
import QRCode from 'qrcode';

const I18N = {
  vi: {
    brandSubtitle: 'Nền tảng Cộng đồng bởi Betech Digital',
    navExplore: 'Khám phá',
    navMap: 'Bản đồ',
    navAddPlace: 'Thêm gánh',
    navLeaderboard: 'Bảng xếp hạng',
    navProfile: 'Hồ sơ',
    navPrivacy: 'Bảo mật',
    ctaCheckin: 'Check-in ngay',
    heroBadge: 'Dự án cộng đồng phi lợi nhuận • Betech Digital',
    heroTitle: 'Mỗi gánh hàng là một câu chuyện mưu sinh',
    heroSubtitle:
      'Cùng cộng đồng lưu giữ bản đồ các gánh hàng rong, xe đẩy và quán nhỏ vỉa hè. Một lần ghé mua hay check-in của bạn giúp cô chú bán hàng sớm về nhà hơn.',
    heroSearchPlaceholder: 'Tìm theo tên gánh, món ăn, đường phố, khu vực...',
    heroExploreMap: 'Mở bản đồ trực tuyến',
    heroAddPlace: 'Đóng góp điểm bán mới',
    statTotalPlaces: 'Điểm mưu sinh đã ghi nhận',
    statTotalCheckins: 'Lượt check-in xác thực',
    statSupportPurchases: 'Lượt ghé mua ủng hộ',
    statCities: 'Tỉnh / Thành phố có mặt',
    filterAllCities: 'Tất cả tỉnh / thành phố',
    filterAllCategories: 'Tất cả danh mục',
    filterAllStatus: 'Tất cả trạng thái',
    filterStatusOpen: 'Đang mở bán',
    filterStatusVerified: 'Đã xác thực cộng đồng',
    sortVerified: 'Cập nhật mới nhất',
    sortSupport: 'Được ủng hộ nhiều nhất',
    sortPopular: 'Nhiều check-in nhất',
    sortAZ: 'Tên A → Z',
    showingResults: 'Hiển thị',
    placesUnit: 'gánh hàng',
    emptyTitle: 'Chưa tìm thấy gánh hàng phù hợp',
    emptyDesc: 'Hãy thử đổi từ khóa tìm kiếm, chọn lại danh mục hoặc đóng góp điểm bán mới cho cộng đồng.',
    resetFilter: 'Xóa bộ lọc',
    statusSoldOut: 'Đã hết hàng hôm nay',
    statusNeedSupport: 'Cần khách ủng hộ',
    statusVerified: 'Đã xác thực',
    statusUnverified: 'Chờ xác thực',
    paymentCash: 'Tiền mặt',
    paymentTransfer: 'Chuyển khoản QR',
    viewDetail: 'Xem hồ sơ',
    btnCheckin: 'Check-in gánh này',
    btnShareQR: 'ID & QR',
    sectionRecentFeed: 'Nhịp sống cộng đồng vừa cập nhật',
    sectionRecentFeedSub: 'Những lượt ghé thăm, mua ủng hộ và báo tin thời gian thực từ người đi đường.',
    sectionFeaturedTitle: 'Danh bạ Gánh Mưu Sinh',
    sectionFeaturedSub: 'Khám phá những gánh hàng bình dị xung quanh bạn và chung tay giữ gìn nét đẹp phố phường.',
    directoryGuideNotice: 'Check-in mới đã duyệt lên trước ♡ Mở Xem thêm để coi địa chỉ, giờ bán và tình trạng Google.',
    mapTitle: 'Bản đồ Gánh Mưu Sinh',
    mapSub: 'Định vị nhanh các gánh hàng rong, xe đẩy và tiệm nhỏ đã có ghim tọa độ.',
    weatherTitle: 'Thời tiết đường phố',
    weatherHumidity: 'Độ ẩm',
    weatherWind: 'Gió',
    weatherRain: 'Lượng mưa',
    flyToPlace: 'Xem ghim',
    openDirections: 'Chỉ đường ↗',
    leaderboardTitle: 'Bảng Vàng Cộng Đồng Mưu Sinh',
    leaderboardSub: 'Vinh danh những tấm lòng tử tế tích cực đóng góp địa điểm, check-in xác thực và mua ủng hộ.',
    topPlacesTitle: 'Các gánh hàng được cộng đồng quan tâm nhất',
    topUsersTitle: 'Thành viên đóng góp tiêu biểu',
    colRank: 'Hạng',
    colMember: 'Thành viên',
    colCheckins: 'Check-in',
    colPurchases: 'Mua ủng hộ',
    colPlacesAdded: 'Thêm gánh',
    colPoints: 'Điểm tử tế',
    detailBack: 'Quay lại danh bạ',
    detailStoryTitle: 'Câu chuyện mưu sinh & Món bán',
    detailLocationTitle: 'Vị trí & Khung giờ hoạt động',
    detailAddress: 'Địa chỉ đã đối chiếu',
    detailHours: 'Giờ mở – đóng cửa',
    detailPrice: 'Mức giá tham khảo',
    detailPayment: 'Hình thức thanh toán',
    detailHint: 'Tình trạng ghi nhận',
    detailCoords: 'Tọa độ GPS',
    detailQrTitle: 'Mã QR định danh Gánh Mưu Sinh',
    detailQrDesc: 'Quét mã này tại gánh hàng để check-in nhanh hoặc chia sẻ cho bạn bè cùng ghé ủng hộ.',
    detailDownloadQr: 'Tải ảnh QR',
    detailCopyLink: 'Sao chép liên kết',
    detailCheckinHistory: 'Lịch sử Check-in & Cập nhật từ cộng đồng',
    detailReportTitle: 'Báo cáo cập nhật hoặc sai lệch thông tin',
    detailReportReason: 'Nội dung cần báo cáo',
    detailReportNote: 'Ghi chú chi tiết cho ban quản trị',
    detailReportSubmit: 'Gửi báo cáo',
    checkinPageTitle: 'Check-in & Cập nhật tình trạng gánh hàng',
    checkinPageSub: 'Mỗi lượt check-in giúp người đến sau biết cô chú còn bán hay đã về, đang đông hay vắng khách.',
    checkinSelectPlace: 'Chọn gánh hàng bạn đang ghé thăm',
    checkinStatusLabel: 'Tình trạng hiện tại của gánh hàng',
    checkinStatusSelling: 'Đang bán bình thường',
    checkinStatusNeedHelp: 'Đang vắng khách • Cần ủng hộ',
    checkinStatusCrowded: 'Đang đông khách',
    checkinStatusSoldOut: 'Đã bán hết hôm nay',
    checkinStatusClosed: 'Hôm nay nghỉ bán',
    checkinBoughtToggle: 'Tôi có ghé mua ủng hộ cô chú trong lần check-in này',
    checkinNoteLabel: 'Lời nhắn hoặc chia sẻ ngắn (món ngon, thái độ, giá cả...)',
    checkinNotePlaceholder: 'Ví dụ: Cụ vẫn còn khoảng 15 gói xôi lạc nóng hổi, đứng ngay đầu ngõ...',
    checkinSubmitBtn: 'Gửi Check-in Xác Thực (+15 điểm)',
    addPlaceTitle: 'Đóng góp Gánh Mưu Sinh mới lên bản đồ',
    addPlaceSub: 'Giúp một gánh hàng rong, xe đẩy hoặc quán nhỏ của người lao động được nhiều người biết tới hơn.',
    accountTitle: 'Hồ sơ Thành viên Cộng đồng',
    accountSub: 'Quản lý danh xưng, theo dõi dấu ấn tử tế và huy hiệu đóng góp của bạn.',
    accountDisplayName: 'Tên hiển thị cộng đồng',
    accountSaveBtn: 'Lưu thay đổi hồ sơ',
    accountPoints: 'Tổng điểm tử tế',
    accountBadgesTitle: 'Huy hiệu cộng đồng đã đạt',
    privacyTitle: 'Chính sách Bảo mật & Quy tắc Cộng đồng',
    privacySub: 'Cam kết bảo vệ quyền riêng tư và tôn trọng phẩm giá của người lao động đường phố.',
    footerAbout:
      'Nền tảng bản đồ số cộng đồng kết nối những tấm lòng tử tế với các gánh hàng rong, xe đẩy mưu sinh trên khắp Việt Nam. Được phát triển và đồng hành công nghệ bởi Betech Digital.',
    footerQuickLinks: 'Điều hướng nhanh',
    footerCompanyTitle: 'Đơn vị phát triển & Vận hành công nghệ',
    footerCompanyName: 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ BETECH (BETECH DIGITAL)',
    footerAddress: 'Địa chỉ: Lầu 5, Tòa nhà St.Moritz, 1014 Phạm Văn Đồng, P. Hiệp Bình Chánh, TP. Thủ Đức, TP.HCM',
    footerCopyright: '© 2026 Betech Digital × Gánh Mưu Sinh. Bảo lưu mọi quyền.',
    copiedToast: 'Đã sao chép liên kết vào bộ nhớ tạm!',
    checkinSuccessToast: 'Check-in thành công! Cảm ơn tấm lòng của bạn.',
    addPlaceSuccessToast: 'Đã ghi nhận gánh hàng mới! Cảm ơn bạn đã đóng góp cho cộng đồng.',
    reportSuccessToast: 'Đã gửi báo cáo cập nhật thành công!',
    profileSavedToast: 'Đã cập nhật tên hiển thị thành công!'
  },
  en: {
    brandSubtitle: 'Community Impact Platform by Betech Digital',
    navExplore: 'Explore',
    navMap: 'Live Map',
    navAddPlace: 'Add Vendor',
    navLeaderboard: 'Leaderboard',
    navProfile: 'Profile',
    navPrivacy: 'Privacy',
    ctaCheckin: 'Check-in Now',
    heroBadge: 'Non-Profit Community Initiative • Betech Digital',
    heroTitle: 'Every Street Cart Carries a Livelihood Story',
    heroSubtitle:
      'Join hands to map street vendors, pushcarts, and humble sidewalk stalls across Vietnam. Your visit or check-in helps hardworking elders and vendors head home earlier.',
    heroSearchPlaceholder: 'Search by vendor name, dish, street, or neighborhood...',
    heroExploreMap: 'Explore Interactive Map',
    heroAddPlace: 'Submit a New Vendor',
    statTotalPlaces: 'Documented Street Vendors',
    statTotalCheckins: 'Verified Community Check-ins',
    statSupportPurchases: 'Supportive Purchases',
    statCities: 'Active Provinces / Cities',
    filterAllCities: 'All Cities / Provinces',
    filterAllCategories: 'All Categories',
    filterAllStatus: 'All Statuses',
    filterStatusOpen: 'Currently Open',
    filterStatusVerified: 'Community Verified',
    sortVerified: 'Recently Verified',
    sortSupport: 'Most Supported',
    sortPopular: 'Most Check-ins',
    sortAZ: 'Name A → Z',
    showingResults: 'Showing',
    placesUnit: 'street vendors',
    emptyTitle: 'No matching street vendors found',
    emptyDesc: 'Try adjusting your search keywords, changing category filters, or submitting a new vendor spot.',
    resetFilter: 'Reset Filters',
    statusSoldOut: 'Sold Out Today',
    statusNeedSupport: 'Needs Support',
    statusVerified: 'Verified',
    statusUnverified: 'Pending Verification',
    paymentCash: 'Cash',
    paymentTransfer: 'QR Bank Transfer',
    viewDetail: 'Xem hồ sơ',
    btnCheckin: 'Check-in gánh này',
    btnShareQR: 'ID & QR',
    sectionRecentFeed: 'Real-Time Community Pulse',
    sectionRecentFeedSub: 'Live check-ins, supportive purchases, and street updates from passersby.',
    sectionFeaturedTitle: 'Gánh Mưu Sinh Directory',
    sectionFeaturedSub: 'Discover humble street stalls around you and help preserve neighborhood livelihoods.',
    directoryGuideNotice: 'Check-in mới đã duyệt lên trước ♡ Mở Xem thêm để coi địa chỉ, giờ bán và tình trạng Google.',
    mapTitle: 'Interactive Street Livelihood Map',
    mapSub: 'Locate street vendors, pushcarts, and sidewalk stalls in your neighborhood.',
    weatherTitle: 'Street Weather Watch',
    weatherHumidity: 'Humidity',
    weatherWind: 'Wind',
    weatherRain: 'Precipitation',
    flyToPlace: 'Xem ghim',
    openDirections: 'Chỉ đường ↗',
    leaderboardTitle: 'Community Kindness Leaderboard',
    leaderboardSub: 'Honoring kind-hearted contributors who map vendors, verify statuses, and buy to support.',
    topPlacesTitle: 'Most Supported Street Vendors',
    topUsersTitle: 'Top Community Contributors',
    colRank: 'Rank',
    colMember: 'Contributor',
    colCheckins: 'Check-ins',
    colPurchases: 'Support Buys',
    colPlacesAdded: 'Vendors Added',
    colPoints: 'Kindness Pts',
    detailBack: 'Back to Directory',
    detailStoryTitle: 'Livelihood Story & Offerings',
    detailLocationTitle: 'Location & Operating Hours',
    detailAddress: 'Verified Address',
    detailHours: 'Operating Hours',
    detailPrice: 'Typical Price Range',
    detailPayment: 'Payment Methods',
    detailHint: 'Observed Status',
    detailCoords: 'GPS Coordinates',
    detailQrTitle: 'Gánh Mưu Sinh Vendor QR Code',
    detailQrDesc: 'Scan this code at the stall for instant check-in or share it with friends to visit and support.',
    detailDownloadQr: 'Download QR PNG',
    detailCopyLink: 'Copy Share Link',
    detailCheckinHistory: 'Community Check-ins & Live Updates',
    detailReportTitle: 'Report Status Change or Correction',
    detailReportReason: 'Reason for report',
    detailReportNote: 'Detailed notes for moderators',
    detailReportSubmit: 'Submit Report',
    checkinPageTitle: 'Check-in & Update Vendor Status',
    checkinPageSub: 'Every check-in helps the next passerby know whether the vendor is still selling, busy, or sold out.',
    checkinSelectPlace: 'Select the street vendor you are visiting',
    checkinStatusLabel: 'Current status at the stall',
    checkinStatusSelling: 'Open & Selling Normally',
    checkinStatusNeedHelp: 'Quiet / Needs Customer Support',
    checkinStatusCrowded: 'Busy with Customers',
    checkinStatusSoldOut: 'Sold Out for Today',
    checkinStatusClosed: 'Not Selling Today',
    checkinBoughtToggle: 'I made a purchase to support this vendor during my visit',
    checkinNoteLabel: 'Short note or tip (dishes left, helpful directions, etc.)',
    checkinNotePlaceholder: 'Example: Grandma still has about 15 warm sticky rice packs left right by the alley entrance...',
    checkinSubmitBtn: 'Submit Verified Check-in (+15 pts)',
    addPlaceTitle: 'Contribute a New Street Vendor to the Map',
    addPlaceSub: 'Help a street hawker, pushcart, or humble stall get discovered and supported by the community.',
    accountTitle: 'Community Member Profile',
    accountSub: 'Manage your display name, track your kindness impact, and view earned badges.',
    accountDisplayName: 'Community Display Name',
    accountSaveBtn: 'Save Profile Changes',
    accountPoints: 'Total Kindness Points',
    accountBadgesTitle: 'Earned Community Badges',
    privacyTitle: 'Privacy Policy & Community Guidelines',
    privacySub: 'Committed to protecting privacy and honoring the dignity of street vendors.',
    footerAbout:
      'A community digital mapping platform connecting kind hearts with street vendors and humble livelihoods across Vietnam. Engineered and powered by Betech Digital.',
    footerQuickLinks: 'Quick Navigation',
    footerCompanyTitle: 'Technology & Platform Partner',
    footerCompanyName: 'BETECH TECHNOLOGY SOLUTIONS CO., LTD (BETECH DIGITAL)',
    footerAddress: 'Address: 5th Floor, St.Moritz Building, 1014 Pham Van Dong, Thu Duc City, Ho Chi Minh City',
    footerCopyright: '© 2026 Betech Digital × Gánh Mưu Sinh. All rights reserved.',
    copiedToast: 'Share link copied to clipboard!',
    checkinSuccessToast: 'Check-in recorded! Thank you for supporting the community.',
    addPlaceSuccessToast: 'New vendor submitted! Thank you for contributing.',
    reportSuccessToast: 'Report submitted to community moderators!',
    profileSavedToast: 'Profile display name updated!'
  }
};

const CATEGORY_LABELS = {
  other: { vi: 'Khác / chưa rõ', en: 'Other / Unspecified', icon: '📌' },
  food: { vi: 'Đồ ăn', en: 'Food', icon: '🍜' },
  drink: { vi: 'Đồ uống', en: 'Drink', icon: '🧋' },
  goods: { vi: 'Hàng hóa', en: 'Goods', icon: '🧺' },
  service: { vi: 'Dịch vụ', en: 'Service', icon: '🔧' }
};

const state = {
  lang: new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'vi',
  route: window.location.pathname || '/',
  config: null,
  me: null,
  directorySummary: null,
  places: [],
  feed: [],
  leaderboard: null,
  weather: null,
  currentDetail: null,
  filters: {
    q: '',
    city: '',
    category: '',
    status: '',
    sort: 'verified'
  },
  selectedMapSlug: new URLSearchParams(window.location.search).get('slug') || null,
  mapInstance: null,
  mapMarkers: [],
  addPlaceMapInstance: null,
  addPlaceMarker: null,
  addPlacePin: null,
  addPlaceLocationResults: [],
  addPlaceLocationLabel: '',
  addPlaceGoogleMapsUrl: '',
  mobileDrawerOpen: false,
  toastMessage: null,
  uploadedPhotoFile: null,
  uploadedPhotoDataUrl: '',
  adminToken: (typeof localStorage !== 'undefined' && localStorage.getItem('gms_admin_token')) || '',
  pendingDeleteSlug: null,
  pendingDeleteName: ''
};

function isAdmin() {
  return Boolean(state.me?.is_admin || state.me?.volunteer?.is_admin || state.adminToken);
}

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.vi[key] || key;
}

function catLabel(slug) {
  const entry = CATEGORY_LABELS[slug] || CATEGORY_LABELS.other;
  return `${entry.icon} ${entry[state.lang] || entry.vi}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatVnd(amount) {
  if (!amount && amount !== 0) return '';
  return Number(amount).toLocaleString(state.lang === 'en' ? 'en-US' : 'vi-VN') + 'đ';
}

function formatPriceRange(min, max) {
  if (!min && !max) return '';
  if (min && max && min !== max) return `${formatVnd(min)} – ${formatVnd(max)}`;
  return formatVnd(min || max);
}

function formatRelativeTime(tsOrIso) {
  if (!tsOrIso) return state.lang === 'en' ? 'Recently' : 'Vừa xong';
  const ms = typeof tsOrIso === 'number' && tsOrIso < 1e12 ? tsOrIso * 1000 : new Date(tsOrIso).getTime();
  if (!Number.isFinite(ms)) return state.lang === 'en' ? 'Recently' : 'Vừa xong';
  const diffMs = Math.max(60000, Date.now() - ms);
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) {
    return state.lang === 'en' ? `${mins}m ago` : `${mins} phút trước`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return state.lang === 'en' ? `${hours}h ago` : `${hours} giờ trước`;
  }
  const days = Math.floor(hours / 24);
  return state.lang === 'en' ? `${days}d ago` : `${days} ngày trước`;
}

function formatDateVi(tsOrIso) {
  if (!tsOrIso) return 'Chưa rõ thời điểm';
  const ms =
    typeof tsOrIso === 'number'
      ? tsOrIso < 1e12
        ? tsOrIso * 1000
        : tsOrIso
      : /^\d+$/.test(String(tsOrIso).trim())
      ? Number(tsOrIso) < 1e12
        ? Number(tsOrIso) * 1000
        : Number(tsOrIso)
      : new Date(tsOrIso).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 'Chưa rõ thời điểm';
  const d = new Date(ms);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function parseJsonSafe(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function toCoordOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function inferCityAndDistrict(addressText, fallbackDesc = '', rawCity = '', rawDistrict = '') {
  if (rawCity && rawDistrict) {
    return { city: rawCity, district: rawDistrict };
  }

  const baseText =
    addressText && addressText !== 'Chưa có địa chỉ đã đối chiếu'
      ? addressText
      : fallbackDesc || '';

  if (!baseText) {
    return { city: rawCity || '', district: rawDistrict || '' };
  }

  // Strip reference note suffix and clean postal codes
  const withoutRefNote = baseText.split(/Ghim tham chiếu/i)[0].trim();
  const rawParts = withoutRefNote
    .split(',')
    .map((s) =>
      s
        .replace(/\b\d{5,6}\b/g, '')
        .replace(/\([^)]*\)/g, '')
        .trim()
    )
    .filter(Boolean);

  while (rawParts.length > 0 && /^(việt nam|vietnam)$/i.test(rawParts[rawParts.length - 1])) {
    rawParts.pop();
  }

  const combined = `${withoutRefNote} ${fallbackDesc}`;

  if (/thị xã quảng trị|quảng trị/i.test(combined)) {
    return {
      city: 'Quảng Trị',
      district: rawParts[0] || 'Thị xã Quảng Trị'
    };
  }
  if (/hoàn kiếm/i.test(combined)) {
    return { city: 'Hà Nội', district: 'Hoàn Kiếm' };
  }
  if (/lạc long quân|hồ tây/i.test(combined)) {
    return { city: 'Hà Nội', district: 'Tây Hồ' };
  }
  if (/khuất duy tiến|nguyễn trãi.*hà nội/i.test(combined)) {
    return { city: 'Hà Nội', district: 'Thanh Xuân' };
  }
  if (/phố cổ hà nội|hà nội/i.test(combined)) {
    return {
      city: 'Hà Nội',
      district: rawParts.length >= 2 ? rawParts[rawParts.length - 2] : rawParts[0] || 'Hoàn Kiếm'
    };
  }
  if (/cần thơ|đề thám.*cần thơ/i.test(combined)) {
    return { city: 'Cần Thơ', district: 'Đề Thám' };
  }
  if (/hạ long/i.test(combined)) {
    return { city: 'Quảng Ninh', district: 'Hạ Long' };
  }
  if (/sầm sơn/i.test(combined)) {
    return { city: 'Thanh Hóa', district: 'Sầm Sơn' };
  }
  if (/quy nhơn/i.test(combined)) {
    return { city: 'Bình Định', district: 'Quy Nhơn' };
  }
  if (/nha trang/i.test(combined)) {
    return { city: 'Khánh Hòa', district: 'Nha Trang' };
  }
  if (/vũng tàu/i.test(combined)) {
    return { city: 'Bà Rịa - Vũng Tàu', district: 'Vũng Tàu' };
  }
  if (/đà lạt/i.test(combined)) {
    return { city: 'Lâm Đồng', district: 'Đà Lạt' };
  }
  if (/thái nguyên|đồng quang/i.test(combined)) {
    return { city: 'Thái Nguyên', district: 'Linh Sơn' };
  }
  if (/bạc liêu|giá rai/i.test(combined)) {
    return { city: 'Bạc Liêu', district: 'Vĩnh Bình' };
  }
  if (/nhơn trạch/i.test(combined)) {
    return { city: 'Đồng Nai', district: 'Nhơn Trạch' };
  }
  if (/biên hòa/i.test(combined)) {
    return { city: 'Đồng Nai', district: 'Biên Hòa' };
  }
  if (/long khánh/i.test(combined)) {
    return { city: 'Đồng Nai', district: 'Long Khánh' };
  }
  if (/tp vinh|hưng chính/i.test(combined)) {
    return { city: 'Nghệ An', district: 'TP. Vinh' };
  }
  if (/trường tiền|sông hương/i.test(combined)) {
    return { city: 'Thừa Thiên Huế', district: 'TP. Huế' };
  }
  if (/thiên lôi/i.test(combined)) {
    return { city: 'Hải Phòng', district: 'Lê Chân' };
  }
  if (/dĩ an/i.test(combined)) {
    return { city: 'Hồ Chí Minh', district: 'Dĩ An' };
  }

  if (rawParts.length >= 2) {
    const lastPart = rawParts[rawParts.length - 1];
    const prevPart = rawParts[rawParts.length - 2];
    if (/hồ chí minh|tp\.?\s*hcm|sài gòn/i.test(lastPart)) {
      return {
        city: 'Hồ Chí Minh',
        district: prevPart
      };
    }
    return {
      city: rawCity || lastPart,
      district: rawDistrict || prevPart
    };
  }

  if (/hồ chí minh|tp\.?\s*hcm|quận\s*\d|bình thạnh|tân phú|phú nhuận|gò vấp|thủ đức|nhiêu lộc|huỳnh thúc kháng|ngô tất tố|lê văn lương|tạ uyên|tôn thất thuyết|nguyễn kiệm/i.test(combined)) {
    const qMatch = combined.match(/(Quận\s*\d+|Q\.\s*\d+|Phường\s+[^,.;()]+|Bình Trưng|Bình Thạnh|Tân Quý|Phú Mỹ)/i);
    return {
      city: 'Hồ Chí Minh',
      district: rawDistrict || (qMatch ? qMatch[1].trim() : rawParts[0] || '')
    };
  }

  return {
    city: rawCity || '',
    district: rawDistrict || rawParts[0] || ''
  };
}

function getGoogleMapsHref(item) {
  if (item.google_maps_url) return item.google_maps_url;
  if (item.has_pin && item.lat != null && item.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.lat},${item.lng}`)}`;
  }
  const q = [
    item.name,
    item.address_text && item.address_text !== 'Chưa có địa chỉ đã đối chiếu' ? item.address_text : ''
  ]
    .filter(Boolean)
    .join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || 'Gánh Mưu Sinh')}`;
}

function hasDirectGooglePlaceLink(item) {
  const url = String(item?.google_maps_url || '');
  return url.includes('query_place_id') || url.includes('cid=');
}

function buildUrl(path, extraParams = {}) {
  const url = new URL(path, window.location.origin);
  url.searchParams.set('lang', state.lang);
  for (const [k, v] of Object.entries(extraParams)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  }
  return url.pathname + url.search;
}

function showToast(msg) {
  state.toastMessage = msg;
  const existing = document.getElementById('betech-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'betech-toast';
  toast.className = 'toast-banner';
  toast.innerHTML = `
    <span class="toast-dot"></span>
    <span>${escapeHtml(msg)}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3800);
}

async function fetchJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.adminToken) {
    headers['X-Admin-Token'] = state.adminToken;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errData = null;
    try {
      errData = await res.json();
    } catch {
      // ignore
    }
    const err = new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = errData;
    throw err;
  }
  return res.json();
}

function normalizePlaceRecord(raw = {}, dirMatch = {}) {
  const googleDetails = parseJsonSafe(raw.google_maps_details);
  const profileDetails = parseJsonSafe(raw.profile_details);

  const coverKey = raw.cover_key || dirMatch.cover_key || '';
  let coverPhotoUrl = '';
  let coverPhotoLargeUrl = '';

  if (raw.cover_photo_url || dirMatch.cover_photo_url) {
    coverPhotoUrl = raw.cover_photo_url || dirMatch.cover_photo_url;
    coverPhotoLargeUrl = raw.cover_photo_large_url || dirMatch.cover_photo_large_url || coverPhotoUrl;
  } else if (coverKey) {
    if (
      coverKey.startsWith('/') ||
      coverKey.startsWith('http://') ||
      coverKey.startsWith('https://') ||
      coverKey.startsWith('data:')
    ) {
      coverPhotoUrl = coverKey;
      coverPhotoLargeUrl = coverKey;
    } else if (coverKey.startsWith('uploads/')) {
      coverPhotoUrl = '/media/' + coverKey;
      coverPhotoLargeUrl = '/media/' + coverKey;
    } else {
      const cleanKey = coverKey.replace(/^retained\//, '');
      coverPhotoUrl = '/media/' + cleanKey + '/480.webp?brand=1';
      coverPhotoLargeUrl = '/media/' + cleanKey + '/1200.webp?brand=1';
    }
  } else {
    const fallbackSvg = `/media/retained/${encodeURIComponent(raw.id || raw.slug || 'ganh')}/cover.svg`;
    coverPhotoUrl = fallbackSvg;
    coverPhotoLargeUrl = fallbackSvg;
  }

  const googleLat = toCoordOrNull(raw.google_lat);
  const googleLng = toCoordOrNull(raw.google_lng);
  const manualLat = toCoordOrNull(raw.manual_lat);
  const manualLng = toCoordOrNull(raw.manual_lng);
  const approximateLat = toCoordOrNull(raw.approximate_lat);
  const approximateLng = toCoordOrNull(raw.approximate_lng);
  const rawLat = toCoordOrNull(raw.lat ?? dirMatch.lat);
  const rawLng = toCoordOrNull(raw.lng ?? dirMatch.lng);

  const hasManualCoords = manualLat != null && manualLng != null;
  const hasGoogleCoords = googleLat != null && googleLng != null;
  const hasApproxCoords = approximateLat != null && approximateLng != null;
  const hasRawCoords = rawLat != null && rawLng != null;
  const hasPin = Boolean(hasManualCoords || hasGoogleCoords || hasApproxCoords || hasRawCoords);

  const lat = manualLat ?? googleLat ?? approximateLat ?? rawLat ?? null;
  const lng = manualLng ?? googleLng ?? approximateLng ?? rawLng ?? null;

  const addressText =
    (
      profileDetails.address ||
      googleDetails.address ||
      raw.address_text ||
      raw.address ||
      dirMatch.address ||
      ''
    ).trim() || 'Chưa có địa chỉ đã đối chiếu';

  const hoursText = (profileDetails.hours || googleDetails.hours || raw.hours_text || '').trim();
  const observedStatus = (
    googleDetails.observed_status ||
    googleDetails.status ||
    profileDetails.observed_status ||
    profileDetails.status ||
    ''
  ).trim();
  const observedAt =
    raw.google_location_observed_at || googleDetails.observed_at || profileDetails.observed_at || '';

  const { city, district } = inferCityAndDistrict(
    addressText,
    raw.description || raw.summary || '',
    raw.city || '',
    raw.district || ''
  );

  const checkins = Number(raw.checkin_count ?? 0);
  const supportCount = Number(raw.support_purchase_count ?? checkins);
  const rawCat = raw.category || raw.category_slug || 'other';
  const categorySlug = CATEGORY_LABELS[rawCat] ? rawCat : 'other';

  return {
    id: raw.id || dirMatch.id || raw.slug,
    slug: raw.slug || dirMatch.slug,
    name: raw.display_name || raw.name || dirMatch.display_name || 'Gánh Mưu Sinh',
    summary: raw.description || raw.summary || observedStatus || addressText,
    category_slug: categorySlug,
    city,
    district,
    address_text: addressText,
    hours_text: hoursText,
    observed_status: observedStatus,
    observed_at: observedAt,
    location_hint: observedStatus || raw.location_hint || '',
    google_maps_url: raw.google_maps_url || dirMatch.google_maps_url || '',
    google_maps_name: raw.google_maps_name || dirMatch.google_maps_name || '',
    google_maps_details: googleDetails,
    profile_details: profileDetails,
    google_lat: googleLat,
    google_lng: googleLng,
    google_location_observed_at: raw.google_location_observed_at || googleDetails.observed_at || null,
    manual_lat: manualLat,
    manual_lng: manualLng,
    manual_location_source: raw.manual_location_source || null,
    approximate_lat: approximateLat,
    approximate_lng: approximateLng,
    has_pin: hasPin,
    lat,
    lng,
    cover_photo_url: coverPhotoUrl,
    cover_photo_large_url: coverPhotoLargeUrl,
    checkin_count: checkins,
    support_purchase_count: supportCount,
    price_min_vnd: raw.price_min_vnd || null,
    price_max_vnd: raw.price_max_vnd || null,
    sold_out_today: raw.status === 'sold_out' || raw.status === 'off' ? 1 : 0,
    needs_support_today: raw.status === 'available' || raw.status === 'slow' ? 1 : 0,
    verification_status: 'verified',
    accepts_transfer: 1,
    last_checkin_at: raw.last_checkin_at || raw.updated_at || 0,
    latest_checkin: raw.latest_checkin || null,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : []
  };
}

async function loadInitialData() {
  const [configRes, meRes, summaryRes, dirRes, feed1Res, lbRes, weatherRes] = await Promise.all([
    fetchJson('/api/config').catch(() => ({})),
    fetchJson('/api/me').catch(() => ({})),
    fetchJson('/api/directory-summary').catch(() => ({})),
    fetchJson('/api/place-directory').catch(() => ({ items: [] })),
    fetchJson('/api/feed').catch(() => ({ items: [], next: null })),
    fetchJson('/api/leaderboard').catch(() => ({ items: [] })),
    fetchJson('/api/weather').catch(() => ({}))
  ]);

  const allFeedRaw = Array.isArray(feed1Res.items) ? [...feed1Res.items] : [];
  let nextCursor = feed1Res.next;
  for (let pageIdx = 0; pageIdx < 10 && nextCursor; pageIdx++) {
    const pageRes = await fetchJson(`/api/feed?before=${encodeURIComponent(nextCursor)}`).catch(() => ({
      items: [],
      next: null
    }));
    if (Array.isArray(pageRes.items) && pageRes.items.length > 0) {
      allFeedRaw.push(...pageRes.items);
    }
    nextCursor = pageRes.next || null;
  }

  const dirList = Array.isArray(dirRes.items) ? dirRes.items : [];
  const dirBySlug = new Map(dirList.map((d) => [d.slug, d]));
  const feedBySlug = new Map(allFeedRaw.map((f) => [f.slug, f]));

  const mergedPlaces = [];
  const seenSlugs = new Set();

  for (const f of allFeedRaw) {
    if (f && f.slug && !seenSlugs.has(f.slug)) {
      seenSlugs.add(f.slug);
      mergedPlaces.push(normalizePlaceRecord(f, dirBySlug.get(f.slug)));
    }
  }

  for (const d of dirList) {
    if (d && d.slug && !seenSlugs.has(d.slug)) {
      seenSlugs.add(d.slug);
      mergedPlaces.push(normalizePlaceRecord(feedBySlug.get(d.slug) || d, d));
    }
  }

  state.config = configRes;
  const baseMe = meRes.volunteer || meRes.viewer || meRes || {};
  state.me = {
    ...baseMe,
    is_admin: Boolean(meRes.is_admin || baseMe.is_admin || state.adminToken)
  };
  state.directorySummary = summaryRes;
  state.places = mergedPlaces;
  state.feed = mergedPlaces.map((p) => ({
    place_slug: p.slug,
    place_name: p.name,
    user_display_name: p.latest_checkin?.submitter_name || 'Tình nguyện viên Cộng đồng',
    created_at: p.latest_checkin?.created_at || p.last_checkin_at,
    note: p.summary,
    status_text: p.sold_out_today ? t('statusSoldOut') : t('statusVerified'),
    supported_purchase: 1
  }));
  state.leaderboard = lbRes;
  state.weather = weatherRes.weather || weatherRes;
  if (!state.selectedMapSlug && state.places.length > 0) {
    const firstWithPin = state.places.find((p) => p.has_pin) || state.places[0];
    state.selectedMapSlug = firstWithPin.slug;
  }
}

async function loadLivelihoodDetail(slug) {
  try {
    const data = await fetchJson(`/api/livelihoods/${encodeURIComponent(slug)}`);
    const rawItem = data.item || data;
    const dirMatch = state.places.find((p) => p.slug === slug) || {};
    const normalized = normalizePlaceRecord(rawItem, dirMatch);
    normalized.recent_checkins = (Array.isArray(data.timeline) ? data.timeline : []).map((tl) => ({
      user_display_name: tl.submitter_name || 'Bạn đường tử tế',
      created_at: tl.created_at,
      note: tl.caption || normalized.summary
    }));
    state.currentDetail = normalized;
  } catch {
    const fallback = state.places.find((p) => p.slug === slug) || state.places[0] || null;
    state.currentDetail = fallback;
  }
}

function getFilteredPlaces() {
  const q = state.filters.q.trim().toLowerCase();
  const city = state.filters.city;
  const category = state.filters.category;
  const status = state.filters.status;
  const sort = state.filters.sort;

  const filtered = state.places.filter((item) => {
    if (city && item.city !== city) return false;
    if (category && item.category_slug !== category) return false;
    if (status === 'open' && Number(item.sold_out_today) === 1) return false;
    if (status === 'verified' && item.verification_status !== 'verified') return false;
    if (q) {
      const haystack = [
        item.name,
        item.google_maps_name,
        item.summary,
        item.address_text,
        item.district,
        item.city,
        item.observed_status,
        item.hours_text
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === 'support') {
      return (Number(b.support_purchase_count) || 0) - (Number(a.support_purchase_count) || 0);
    }
    if (sort === 'popular') {
      return (Number(b.checkin_count) || 0) - (Number(a.checkin_count) || 0);
    }
    if (sort === 'az') {
      return String(a.name || '').localeCompare(String(b.name || ''), 'vi');
    }
    const aRich = Number(hasDirectGooglePlaceLink(a) && a.has_pin && Boolean(a.hours_text || a.observed_status));
    const bRich = Number(hasDirectGooglePlaceLink(b) && b.has_pin && Boolean(b.hours_text || b.observed_status));
    if (bRich !== aRich) return bRich - aRich;
    return (Number(b.last_checkin_at) || 0) - (Number(a.last_checkin_at) || 0);
  });

  return filtered;
}

function getPlacePhoto(item, large = false) {
  if (large && item.cover_photo_large_url) return item.cover_photo_large_url;
  if (item.cover_photo_url) return item.cover_photo_url;
  if (Array.isArray(item.photos) && item.photos.length > 0) {
    const first = item.photos[0];
    return typeof first === 'string' ? first : first.photo_url || first.url;
  }
  return `/media/retained/${encodeURIComponent(item.id || item.slug || 'ganh')}/cover.svg`;
}

function renderHeader() {
  const path = state.route;
  const isExplore = path === '/';
  const isMap = path === '/map';
  const isAdd = path === '/add-place';
  const isLeaderboard = path === '/leaderboard';
  const isAccount = path === '/account';

  return `
    <header class="site-header" role="banner">
      <div class="container header-inner">
        <a href="${buildUrl('/')}" class="brand-link" data-nav="/">
          <div class="brand-logos">
            <img src="/images/logo-betech.png" alt="Betech Digital" class="brand-logo" width="128" height="36" />
          </div>
          <div class="brand-divider" aria-hidden="true"></div>
          <div class="brand-titles">
            <span class="brand-app-name">Gánh Mưu Sinh</span>
            <span class="brand-app-sub">${escapeHtml(t('brandSubtitle'))}</span>
          </div>
        </a>

        <nav class="desktop-nav" aria-label="Primary Navigation">
          <a href="${buildUrl('/')}" class="nav-pill ${isExplore ? 'active' : ''}" data-nav="/">${escapeHtml(t('navExplore'))}</a>
          <a href="${buildUrl('/map')}" class="nav-pill ${isMap ? 'active' : ''}" data-nav="/map">${escapeHtml(t('navMap'))}</a>
          <a href="${buildUrl('/add-place')}" class="nav-pill ${isAdd ? 'active' : ''}" data-nav="/add-place">${escapeHtml(t('navAddPlace'))}</a>
          <a href="${buildUrl('/leaderboard')}" class="nav-pill ${isLeaderboard ? 'active' : ''}" data-nav="/leaderboard">${escapeHtml(t('navLeaderboard'))}</a>
          <a href="${buildUrl('/account')}" class="nav-pill ${isAccount ? 'active' : ''}" data-nav="/account">${escapeHtml(t('navProfile'))}</a>
          ${isAdmin() ? '<span class="admin-header-badge">🛡️ Admin</span>' : ''}
        </nav>

        <div class="header-actions">
          <div class="lang-switcher" role="group" aria-label="Language switcher">
            <button type="button" class="lang-btn ${state.lang === 'vi' ? 'active' : ''}" data-lang-switch="vi">VI</button>
            <button type="button" class="lang-btn ${state.lang === 'en' ? 'active' : ''}" data-lang-switch="en">EN</button>
          </div>
          <a href="${buildUrl('/checkin')}" class="btn btn-primary btn-sm header-cta" data-nav="/checkin">
            <span>✦</span>
            <span>${escapeHtml(t('ctaCheckin'))}</span>
          </a>
          <button type="button" class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Toggle Menu" aria-expanded="${state.mobileDrawerOpen ? 'true' : 'false'}">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>
        </div>
      </div>

      <div class="mobile-drawer ${state.mobileDrawerOpen ? 'open' : ''}" id="mobile-drawer">
        <nav class="mobile-drawer-nav" aria-label="Mobile Navigation">
          <a href="${buildUrl('/')}" class="mobile-nav-item ${isExplore ? 'active' : ''}" data-nav="/">🧭 ${escapeHtml(t('navExplore'))}</a>
          <a href="${buildUrl('/map')}" class="mobile-nav-item ${isMap ? 'active' : ''}" data-nav="/map">🗺️ ${escapeHtml(t('navMap'))}</a>
          <a href="${buildUrl('/checkin')}" class="mobile-nav-item ${path === '/checkin' ? 'active' : ''}" data-nav="/checkin">✦ ${escapeHtml(t('ctaCheckin'))}</a>
          <a href="${buildUrl('/add-place')}" class="mobile-nav-item ${isAdd ? 'active' : ''}" data-nav="/add-place">➕ ${escapeHtml(t('navAddPlace'))}</a>
          <a href="${buildUrl('/leaderboard')}" class="mobile-nav-item ${isLeaderboard ? 'active' : ''}" data-nav="/leaderboard">🏆 ${escapeHtml(t('navLeaderboard'))}</a>
          <a href="${buildUrl('/account')}" class="mobile-nav-item ${isAccount ? 'active' : ''}" data-nav="/account">👤 ${escapeHtml(t('navProfile'))}</a>
          <a href="${buildUrl('/privacy')}" class="mobile-nav-item ${path === '/privacy' ? 'active' : ''}" data-nav="/privacy">🛡️ ${escapeHtml(t('navPrivacy'))}</a>
        </nav>
      </div>
    </header>
  `;
}

function renderPlaceCard(item) {
  const photo = getPlacePhoto(item, false);
  const soldOut = Number(item.sold_out_today) === 1;
  const needSupport = Number(item.needs_support_today) === 1;
  const verified = item.verification_status === 'verified';
  const detailHref = buildUrl(`/ganh/${encodeURIComponent(item.slug)}`);
  const mapPinHref = buildUrl('/map', { slug: item.slug });
  const checkinHref = buildUrl('/checkin', { slug: item.slug });
  const googleMapsHref = getGoogleMapsHref(item);
  const googleMapsBtnLabel = hasDirectGooglePlaceLink(item) ? 'Mở Google Maps ↗' : 'Tìm trên Google Maps ↗';
  const areaLabel = [item.district, item.city].filter(Boolean).join(', ');
  const adminDeleteBtn = isAdmin()
    ? `<button type="button" class="btn btn-danger btn-sm admin-delete-btn" data-delete-slug="${escapeHtml(item.slug)}" data-delete-name="${escapeHtml(item.name)}">🗑️ Xóa gánh</button>`
    : '';

  return `
    <article class="place-card" data-place-slug="${escapeHtml(item.slug)}">
      <div class="place-card-media">
        <a href="${detailHref}" data-nav="/ganh/${escapeHtml(item.slug)}" class="place-media-link">
          <img
            src="${escapeHtml(photo)}"
            alt="${escapeHtml(item.name)}"
            class="place-card-img"
            loading="lazy"
            width="640"
            height="400"
          />
        </a>
        <div class="place-card-badges">
          <span class="badge badge-category">${escapeHtml(catLabel(item.category_slug))}</span>
          ${
            soldOut
              ? `<span class="badge badge-soldout">${escapeHtml(t('statusSoldOut'))}</span>`
              : needSupport
              ? `<span class="badge badge-support">${escapeHtml(t('statusNeedSupport'))}</span>`
              : verified
              ? `<span class="badge badge-verified">✓ ${escapeHtml(t('statusVerified'))}</span>`
              : `<span class="badge badge-neutral">${escapeHtml(t('statusUnverified'))}</span>`
          }
        </div>
      </div>

      <div class="place-card-body">
        <div class="place-card-meta-top">
          ${areaLabel ? `<span class="place-location-pill">📍 ${escapeHtml(areaLabel)}</span>` : ''}
          ${item.hours_text ? `<span class="place-time-pill">🕒 ${escapeHtml(item.hours_text)}</span>` : ''}
        </div>

        <h3 class="place-card-title">
          <a href="${detailHref}" data-nav="/ganh/${escapeHtml(item.slug)}">${escapeHtml(item.name)}</a>
        </h3>

        <p class="place-card-summary">${escapeHtml(item.summary || '')}</p>

        <p class="card-address">📍 ${escapeHtml(item.address_text)}</p>

        <div class="feed-direct-actions place-card-actions">
          <a href="${detailHref}" class="btn btn-secondary btn-sm" data-nav="/ganh/${escapeHtml(item.slug)}">
            Xem hồ sơ
          </a>
          ${
            item.has_pin
              ? `<a href="${mapPinHref}" class="btn btn-secondary btn-sm" data-nav="/map?slug=${escapeHtml(item.slug)}">
                   Xem ghim
                 </a>`
              : `<button type="button" class="btn btn-ghost btn-sm" disabled>Chưa có ghim</button>`
          }
          <a href="${checkinHref}" class="btn btn-primary btn-sm" data-nav="/checkin?slug=${escapeHtml(item.slug)}" data-checkin-slug="${escapeHtml(item.slug)}">
            Check-in gánh này
          </a>
          ${adminDeleteBtn}
        </div>

        <details class="card-expand">
          <summary>Xem thêm ＋</summary>
          <div class="card-expand-body">
            <p class="original-source-name">
              <span>Tên trên Google Maps: </span>
              <a class="source-link" href="${escapeHtml(googleMapsHref)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(item.google_maps_name || item.name)}
              </a>
            </p>

            <dl class="google-place-details">
              <div class="google-detail-row">
                <dt>Địa chỉ</dt>
                <dd>${escapeHtml(item.address_text)}</dd>
              </div>
              <div class="google-detail-row">
                <dt>Giờ mở – đóng cửa</dt>
                <dd>${escapeHtml(item.hours_text || 'Chưa cập nhật')}</dd>
              </div>
              <div class="google-detail-row">
                <dt>Tình trạng trên Google</dt>
                <dd>${escapeHtml(item.observed_status || 'Chưa cập nhật')}</dd>
              </div>
            </dl>

            <p class="source-note">
              Đối chiếu Google Maps: <strong>${escapeHtml(formatDateVi(item.observed_at))}</strong> · Tình trạng tại thời điểm ghi nhận; mở Google Maps để xem mới nhất.
            </p>

            <div class="card-actions">
              <a
                href="${escapeHtml(googleMapsHref)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary btn-sm"
              >
                ${escapeHtml(googleMapsBtnLabel)}
              </a>
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                data-qr-slug="${escapeHtml(item.slug)}"
                data-open-qr="${escapeHtml(item.slug)}"
              >
                ID &amp; QR
              </button>
            </div>
          </div>
        </details>
      </div>
    </article>
  `;
}

function renderDirectoryView() {
  const cities = Array.from(new Set(state.places.map((p) => p.city).filter(Boolean)));
  const categories = Object.keys(CATEGORY_LABELS);
  const filtered = getFilteredPlaces();

  const totalPlaces = state.places.length;
  const totalCheckins = state.places.reduce((acc, p) => acc + (Number(p.checkin_count) || 0), 0);
  const totalPurchases = state.places.reduce((acc, p) => acc + (Number(p.support_purchase_count) || 0), 0);

  return `
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-content">
          <div class="hero-eyebrow">
            <span class="eyebrow-dot"></span>
            <span>${escapeHtml(t('heroBadge'))}</span>
          </div>
          <h1 class="hero-heading">${escapeHtml(t('heroTitle'))}</h1>
          <p class="hero-description">${escapeHtml(t('heroSubtitle'))}</p>

          <div class="hero-search-bar">
            <input
              type="search"
              id="directory-search-input"
              class="hero-search-input"
              placeholder="${escapeHtml(t('heroSearchPlaceholder'))}"
              value="${escapeHtml(state.filters.q)}"
              aria-label="${escapeHtml(t('heroSearchPlaceholder'))}"
            />
            <a href="${buildUrl('/map')}" class="btn btn-primary" data-nav="/map">
              🗺️ ${escapeHtml(t('heroExploreMap'))}
            </a>
            <a href="${buildUrl('/add-place')}" class="btn btn-secondary" data-nav="/add-place">
              ➕ ${escapeHtml(t('heroAddPlace'))}
            </a>
          </div>

          <div class="hero-stats-row">
            <div class="hero-stat-card">
              <span class="hero-stat-number">${totalPlaces}</span>
              <span class="hero-stat-label">${escapeHtml(t('statTotalPlaces'))}</span>
            </div>
            <div class="hero-stat-card">
              <span class="hero-stat-number">${totalCheckins}</span>
              <span class="hero-stat-label">${escapeHtml(t('statTotalCheckins'))}</span>
            </div>
            <div class="hero-stat-card">
              <span class="hero-stat-number">${totalPurchases}</span>
              <span class="hero-stat-label">${escapeHtml(t('statSupportPurchases'))}</span>
            </div>
            <div class="hero-stat-card">
              <span class="hero-stat-number">${cities.length || 1}</span>
              <span class="hero-stat-label">${escapeHtml(t('statCities'))}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-banner-frame hero-visual-card">
            <img
              src="/branding/ganh-muu-sinh-banner-language-v2.jpg"
              alt="Gánh Mưu Sinh × Betech Digital"
              class="hero-banner-img"
              width="640"
              height="640"
            />
            <div class="hero-floating-card">
              <div class="hero-floating-logos">
                <img src="/images/logo-betech.png" alt="Betech Digital" class="floating-betech-logo" width="114" height="32" />
              </div>
              <p class="floating-card-text">
                ${
                  state.lang === 'en'
                    ? 'Technology for human kindness — verified community street vendor directory.'
                    : 'Công nghệ vị nhân sinh — Bản đồ số kết nối cộng đồng ủng hộ gánh hàng rong.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="filter-section">
      <div class="container">
        <div class="filter-bar-card">
          <div class="filter-controls-grid">
            <div class="filter-field">
              <label for="filter-city" class="sr-only">${escapeHtml(t('filterAllCities'))}</label>
              <select id="filter-city" class="form-select">
                <option value="">${escapeHtml(t('filterAllCities'))}</option>
                ${cities
                  .map(
                    (c) =>
                      `<option value="${escapeHtml(c)}" ${state.filters.city === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
                  )
                  .join('')}
              </select>
            </div>

            <div class="filter-field">
              <label for="filter-category" class="sr-only">${escapeHtml(t('filterAllCategories'))}</label>
              <select id="filter-category" class="form-select">
                <option value="">${escapeHtml(t('filterAllCategories'))}</option>
                ${categories
                  .map(
                    (cat) =>
                      `<option value="${escapeHtml(cat)}" ${state.filters.category === cat ? 'selected' : ''}>${escapeHtml(catLabel(cat))}</option>`
                  )
                  .join('')}
              </select>
            </div>

            <div class="filter-field">
              <label for="filter-status" class="sr-only">${escapeHtml(t('filterAllStatus'))}</label>
              <select id="filter-status" class="form-select">
                <option value="">${escapeHtml(t('filterAllStatus'))}</option>
                <option value="open" ${state.filters.status === 'open' ? 'selected' : ''}>${escapeHtml(t('filterStatusOpen'))}</option>
                <option value="verified" ${state.filters.status === 'verified' ? 'selected' : ''}>${escapeHtml(t('filterStatusVerified'))}</option>
              </select>
            </div>

            <div class="filter-field">
              <label for="filter-sort" class="sr-only">Sort</label>
              <select id="filter-sort" class="form-select">
                <option value="verified" ${state.filters.sort === 'verified' ? 'selected' : ''}>${escapeHtml(t('sortVerified'))}</option>
                <option value="support" ${state.filters.sort === 'support' ? 'selected' : ''}>${escapeHtml(t('sortSupport'))}</option>
                <option value="popular" ${state.filters.sort === 'popular' ? 'selected' : ''}>${escapeHtml(t('sortPopular'))}</option>
                <option value="az" ${state.filters.sort === 'az' ? 'selected' : ''}>${escapeHtml(t('sortAZ'))}</option>
              </select>
            </div>
          </div>

          <div class="category-chips-row">
            <button type="button" class="category-chip ${state.filters.category === '' ? 'active' : ''}" data-cat-chip="">
              ✦ ${escapeHtml(t('filterAllCategories'))}
            </button>
            ${categories
              .map(
                (cat) => `
                <button type="button" class="category-chip ${state.filters.category === cat ? 'active' : ''}" data-cat-chip="${escapeHtml(cat)}">
                  ${escapeHtml(catLabel(cat))}
                </button>
              `
              )
              .join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="directory-section">
      <div class="container">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">${escapeHtml(t('sectionFeaturedTitle'))}</h2>
            <p class="section-subtitle">${escapeHtml(t('sectionFeaturedSub'))}</p>
          </div>
          <div class="results-counter">
            ${escapeHtml(t('showingResults'))} <strong>${filtered.length}</strong> ${escapeHtml(t('placesUnit'))}
          </div>
        </div>

        <p class="directory-guide-banner">${escapeHtml(t('directoryGuideNotice'))}</p>

        ${
          filtered.length === 0
            ? `
            <div class="empty-state-card">
              <h3>${escapeHtml(t('emptyTitle'))}</h3>
              <p>${escapeHtml(t('emptyDesc'))}</p>
              <button type="button" class="btn btn-primary" id="reset-filters-btn">${escapeHtml(t('resetFilter'))}</button>
            </div>
          `
            : `
            <div class="places-grid" id="places-grid">
              ${filtered.map((item) => renderPlaceCard(item)).join('')}
            </div>
          `
        }
      </div>
    </section>

    <section class="feed-section">
      <div class="container">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">${escapeHtml(t('sectionRecentFeed'))}</h2>
            <p class="section-subtitle">${escapeHtml(t('sectionRecentFeedSub'))}</p>
          </div>
          <a href="${buildUrl('/checkin')}" class="btn btn-secondary btn-sm" data-nav="/checkin">
            ✦ ${escapeHtml(t('ctaCheckin'))}
          </a>
        </div>

        <div class="feed-grid">
          ${state.feed
            .slice(0, 6)
            .map(
              (f) => `
              <div class="feed-card">
                <div class="feed-card-top">
                  <span class="feed-author">👤 ${escapeHtml(f.user_display_name || f.author_name || 'Bạn đường tử tế')}</span>
                  <span class="feed-time">${escapeHtml(formatRelativeTime(f.created_at))}</span>
                </div>
                <div class="feed-place-link">
                  <a href="${buildUrl(`/ganh/${encodeURIComponent(f.place_slug)}`)}" data-nav="/ganh/${escapeHtml(f.place_slug)}">
                    📍 ${escapeHtml(f.place_name || 'Gánh Mưu Sinh')}
                  </a>
                </div>
                <p class="feed-note">"${escapeHtml(f.note || 'Đã ghé thăm và cập nhật tình trạng gánh hàng.')}"</p>
                <div class="feed-tags">
                  <span class="badge badge-verified">${escapeHtml(f.status_text || 'Đang mở bán')}</span>
                  ${Number(f.supported_purchase) === 1 ? `<span class="badge badge-support">💝 ${state.lang === 'en' ? 'Bought to support' : 'Đã mua ủng hộ'}</span>` : ''}
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderMapPlacePopup(activePlace) {
  if (!activePlace) return '';
  const photo = getPlacePhoto(activePlace, false);
  const googleMapsHref = getGoogleMapsHref(activePlace);
  const detailHref = buildUrl(`/ganh/${encodeURIComponent(activePlace.slug)}`);

  return `
    <div class="map-selected-overlay map-place-popup" id="map-selected-overlay" data-popup-slug="${escapeHtml(activePlace.slug)}">
      <div class="map-popup-header">
        <img
          src="${escapeHtml(photo)}"
          alt="${escapeHtml(activePlace.name)}"
          class="map-popup-thumb"
          width="88"
          height="88"
          loading="lazy"
        />
        <div class="map-overlay-info">
          <span class="badge badge-category">${escapeHtml(catLabel(activePlace.category_slug))}</span>
          <h4>${escapeHtml(activePlace.name)}</h4>
          <p class="card-address">📍 ${escapeHtml(activePlace.address_text)}</p>
        </div>
      </div>

      <details class="card-expand map-popup-expand">
        <summary>Xem thêm ⌄</summary>
        <div class="card-expand-body">
          <p class="original-source-name">
            <span>Tên trên Google Maps: </span>
            <a class="source-link" href="${escapeHtml(googleMapsHref)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(activePlace.google_maps_name || activePlace.name)}
            </a>
          </p>
          <dl class="google-place-details">
            <div class="google-detail-row">
              <dt>Địa chỉ</dt>
              <dd>${escapeHtml(activePlace.address_text)}</dd>
            </div>
            <div class="google-detail-row">
              <dt>Giờ mở – đóng cửa</dt>
              <dd>${escapeHtml(activePlace.hours_text || 'Chưa cập nhật')}</dd>
            </div>
            <div class="google-detail-row">
              <dt>Tình trạng trên Google</dt>
              <dd>${escapeHtml(activePlace.observed_status || 'Chưa cập nhật')}</dd>
            </div>
          </dl>
          <p class="source-note">
            Đối chiếu Google Maps: <strong>${escapeHtml(formatDateVi(activePlace.observed_at))}</strong> · Tình trạng tại thời điểm ghi nhận; mở Google Maps để xem mới nhất.
          </p>
        </div>
      </details>

      <div class="map-overlay-btns">
        <a href="${detailHref}" class="btn btn-primary btn-sm" data-nav="/ganh/${escapeHtml(activePlace.slug)}">
          Xem hồ sơ
        </a>
        <a
          href="${escapeHtml(googleMapsHref)}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-sm"
        >
          Google Maps ↗
        </a>
        ${
          isAdmin()
            ? `<button type="button" class="btn btn-danger btn-xs admin-delete-btn" data-delete-slug="${escapeHtml(activePlace.slug)}" data-delete-name="${escapeHtml(activePlace.name)}">🗑️ Xóa gánh</button>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderMapView() {
  const filtered = getFilteredPlaces();
  const activePlace =
    state.places.find((p) => p.slug === state.selectedMapSlug) ||
    filtered.find((p) => p.has_pin) ||
    filtered[0] ||
    state.places[0];

  const w = state.weather || {};
  const temp = w.temperature_c ?? 29;
  const humidity = w.humidity_percent ?? 74;
  const wind = w.wind_kph ?? 11;

  return `
    <section class="map-page-section">
      <div class="container">
        <div class="map-header-bar">
          <div>
            <h1 class="section-title">${escapeHtml(t('mapTitle'))}</h1>
            <p class="section-subtitle">${escapeHtml(t('mapSub'))}</p>
          </div>

          <div class="weather-widget-card" aria-label="${escapeHtml(t('weatherTitle'))}">
            <div class="weather-main">
              <span class="weather-icon">🌤️</span>
              <div>
                <div class="weather-temp">${escapeHtml(temp)}°C • ${escapeHtml(activePlace?.city || w.city || 'Hồ Chí Minh')}</div>
                <div class="weather-desc">${escapeHtml(w.condition_text || (state.lang === 'en' ? 'Warm street weather' : 'Trời nắng ấm, thuận lợi đi dạo phố'))}</div>
              </div>
            </div>
            <div class="weather-metrics">
              <span>💧 ${escapeHtml(t('weatherHumidity'))}: <strong>${escapeHtml(humidity)}%</strong></span>
              <span>🌬️ ${escapeHtml(t('weatherWind'))}: <strong>${escapeHtml(wind)} km/h</strong></span>
            </div>
          </div>
        </div>

        <div class="map-layout-grid">
          <aside class="map-sidebar">
            <div class="map-sidebar-filters">
              <input
                type="search"
                id="map-search-input"
                class="form-input"
                placeholder="${escapeHtml(t('heroSearchPlaceholder'))}"
                value="${escapeHtml(state.filters.q)}"
              />
              <select id="map-category-select" class="form-select">
                <option value="">${escapeHtml(t('filterAllCategories'))}</option>
                ${Object.keys(CATEGORY_LABELS)
                  .map(
                    (cat) =>
                      `<option value="${escapeHtml(cat)}" ${state.filters.category === cat ? 'selected' : ''}>${escapeHtml(catLabel(cat))}</option>`
                  )
                  .join('')}
              </select>
            </div>

            <div class="map-places-list" role="listbox" aria-label="Street vendors on map">
              ${filtered
                .map((p) => {
                  const isSelected = activePlace && activePlace.slug === p.slug;
                  const areaStr = [p.district, p.city].filter(Boolean).join(', ');
                  return `
                    <div class="map-list-card ${isSelected ? 'active' : ''}" data-map-select="${escapeHtml(p.slug)}">
                      <div class="map-list-card-top">
                        <span class="badge badge-category">${escapeHtml(catLabel(p.category_slug))}</span>
                        <span class="map-list-city">${escapeHtml(areaStr)}</span>
                      </div>
                      <h3 class="map-list-title">${escapeHtml(p.name)}</h3>
                      <p class="map-list-address">📍 ${escapeHtml(p.address_text)}</p>
                      <div class="map-list-actions">
                        ${
                          p.has_pin
                            ? `<button type="button" class="btn btn-secondary btn-xs" data-map-fly="${escapeHtml(p.slug)}">
                                 🎯 Xem ghim
                               </button>`
                            : `<button type="button" class="btn btn-ghost btn-xs" disabled>Chưa có ghim</button>`
                        }
                        <a href="${buildUrl(`/ganh/${encodeURIComponent(p.slug)}`)}" class="btn btn-primary btn-xs" data-nav="/ganh/${escapeHtml(p.slug)}">
                          Xem hồ sơ
                        </a>
                        ${
                          isAdmin()
                            ? `<button type="button" class="btn btn-danger btn-xs admin-delete-btn" data-delete-slug="${escapeHtml(p.slug)}" data-delete-name="${escapeHtml(p.name)}">🗑️ Xóa gánh</button>`
                            : ''
                        }
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </aside>

          <div class="map-canvas-panel">
            <div id="maplibre-canvas" class="maplibre-container" role="region" aria-label="Interactive Map"></div>
            <div id="map-popup-host">
              ${renderMapPlacePopup(activePlace)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderLeaderboardView() {
  const lb = state.leaderboard || {};
  const contributors =
    Array.isArray(lb.items) && lb.items.length > 0
      ? lb.items
      : Array.isArray(lb.top_users)
      ? lb.top_users
      : [
          {
            rank: 1,
            display_name: 'Minh Anh • Sài Gòn Tử Tế',
            checkin_count: 42,
            support_count: 35,
            places_added: 9,
            points: 1180
          },
          {
            rank: 2,
            display_name: 'Hoàng Nam • Betech Volunteer',
            checkin_count: 38,
            support_count: 29,
            places_added: 7,
            points: 1020
          },
          {
            rank: 3,
            display_name: 'Thu Thảo • Hà Nội Phố',
            checkin_count: 31,
            support_count: 24,
            places_added: 6,
            points: 890
          }
        ];

  const topPlaces = [...state.places]
    .sort((a, b) => (Number(b.support_purchase_count) || 0) - (Number(a.support_purchase_count) || 0))
    .slice(0, 6);

  return `
    <section class="page-section">
      <div class="container">
        <div class="page-hero-banner">
          <span class="badge badge-verified">🏆 Betech Digital Community Impact</span>
          <h1 class="section-title">${escapeHtml(t('leaderboardTitle'))}</h1>
          <p class="section-subtitle">${escapeHtml(t('leaderboardSub'))}</p>
        </div>

        <div class="leaderboard-grid">
          <div class="leaderboard-card">
            <h2 class="card-heading">🌟 ${escapeHtml(t('topUsersTitle'))}</h2>
            <div class="table-responsive">
              <table class="betech-table">
                <thead>
                  <tr>
                    <th>${escapeHtml(t('colRank'))}</th>
                    <th>${escapeHtml(t('colMember'))}</th>
                    <th>${escapeHtml(t('colCheckins'))}</th>
                    <th>${escapeHtml(t('colPurchases'))}</th>
                    <th>${escapeHtml(t('colPoints'))}</th>
                  </tr>
                </thead>
                <tbody>
                  ${contributors
                    .map(
                      (u, idx) => `
                      <tr>
                        <td><span class="rank-badge rank-${idx + 1}">#${u.rank || idx + 1}</span></td>
                        <td><strong>${escapeHtml(u.display_name || u.name || 'Thành viên tử tế')}</strong></td>
                        <td>${Number(u.checkin_count ?? u.level ?? 12)}</td>
                        <td>${Number(u.support_count ?? Math.max(1, Math.floor((u.points || 20) / 5)))}</td>
                        <td><span class="points-pill">${Number(u.points ?? u.score ?? 25)} pts</span></td>
                      </tr>
                    `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="leaderboard-card">
            <h2 class="card-heading">💝 ${escapeHtml(t('topPlacesTitle'))}</h2>
            <div class="top-places-stack">
              ${topPlaces
                .map((p, i) => {
                  const areaStr = [p.district, p.city].filter(Boolean).join(', ');
                  return `
                  <div class="top-place-row">
                    <span class="rank-badge rank-${i + 1}">#${i + 1}</span>
                    <div class="top-place-info">
                      <a href="${buildUrl(`/ganh/${encodeURIComponent(p.slug)}`)}" data-nav="/ganh/${escapeHtml(p.slug)}" class="top-place-name">
                        ${escapeHtml(p.name)}
                      </a>
                      <span class="top-place-sub">📍 ${escapeHtml(areaStr || p.address_text)} • ${Number(p.support_purchase_count || 0)} ${state.lang === 'en' ? 'support buys' : 'lượt mua ủng hộ'}</span>
                    </div>
                    <a href="${buildUrl('/checkin', { slug: p.slug })}" class="btn btn-primary btn-xs" data-nav="/checkin?slug=${escapeHtml(p.slug)}" data-checkin-slug="${escapeHtml(p.slug)}">
                      Check-in
                    </a>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderDetailView() {
  const item = state.currentDetail || state.places[0];
  if (!item) {
    return `<div class="container page-section"><p>${escapeHtml(t('emptyTitle'))}</p></div>`;
  }
  const photo = getPlacePhoto(item, true);
  const googleMapsHref = getGoogleMapsHref(item);
  const directionsDest =
    item.has_pin && item.lat != null && item.lng != null ? `${item.lat},${item.lng}` : item.address_text;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionsDest)}`;
  const checkins = Array.isArray(item.recent_checkins)
    ? item.recent_checkins
    : state.feed.filter((f) => f.place_slug === item.slug).slice(0, 5);

  return `
    <section class="page-section detail-section">
      <div class="container">
        <div class="detail-breadcrumb">
          <a href="${buildUrl('/')}" class="btn btn-secondary btn-sm" data-nav="/">
            ← ${escapeHtml(t('detailBack'))}
          </a>
          <div class="detail-top-actions">
            <a href="${buildUrl('/checkin', { slug: item.slug })}" class="btn btn-primary btn-sm" data-nav="/checkin?slug=${escapeHtml(item.slug)}" data-checkin-slug="${escapeHtml(item.slug)}">
              ✦ ${escapeHtml(t('ctaCheckin'))}
            </a>
          </div>
        </div>

        <div class="detail-hero-card">
          <div class="detail-media-col">
            <img src="${escapeHtml(photo)}" alt="${escapeHtml(item.name)}" class="detail-cover-img" width="800" height="500" />
          </div>
          <div class="detail-info-col">
            <div class="place-card-badges">
              <span class="badge badge-category">${escapeHtml(catLabel(item.category_slug))}</span>
              <span class="badge badge-verified">✓ ${escapeHtml(t('statusVerified'))}</span>
            </div>
            <h1 class="detail-title">${escapeHtml(item.name)}</h1>
            <p class="detail-summary">${escapeHtml(item.summary)}</p>

            <div class="source-info">
              <p class="original-source-name">
                <span>Tên trên Google Maps: </span>
                <a class="source-link" href="${escapeHtml(googleMapsHref)}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(item.google_maps_name || item.name)}
                </a>
              </p>

              <dl class="google-place-details">
                <div class="google-detail-row">
                  <dt>Địa chỉ</dt>
                  <dd>${escapeHtml(item.address_text)}</dd>
                </div>
                <div class="google-detail-row">
                  <dt>Giờ mở – đóng cửa</dt>
                  <dd>${escapeHtml(item.hours_text || 'Chưa cập nhật')}</dd>
                </div>
                <div class="google-detail-row">
                  <dt>Tình trạng trên Google</dt>
                  <dd>${escapeHtml(item.observed_status || 'Chưa cập nhật')}</dd>
                </div>
                <div class="google-detail-row">
                  <dt>Thời điểm đối chiếu Google Maps</dt>
                  <dd>${escapeHtml(formatDateVi(item.observed_at))}</dd>
                </div>
              </dl>

              <p class="source-note">
                Đối chiếu Google Maps: <strong>${escapeHtml(formatDateVi(item.observed_at))}</strong> · Tình trạng tại thời điểm ghi nhận; mở Google Maps để xem mới nhất.
              </p>
            </div>

            <div class="detail-cta-row">
              ${
                item.has_pin
                  ? `<a href="${buildUrl('/map', { slug: item.slug })}" class="btn btn-secondary" data-nav="/map?slug=${escapeHtml(item.slug)}">
                       📍 Xem ghim trên bản đồ
                     </a>`
                  : `<button type="button" class="btn btn-ghost" disabled>Chưa có ghim trên bản đồ</button>`
              }
              <a
                href="${escapeHtml(googleMapsHref)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary"
              >
                Mở Google Maps ↗
              </a>
              <a
                href="${escapeHtml(directionsHref)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary"
              >
                Chỉ đường ↗
              </a>
              <a href="${buildUrl('/checkin', { slug: item.slug })}" class="btn btn-primary" data-nav="/checkin?slug=${escapeHtml(item.slug)}" data-checkin-slug="${escapeHtml(item.slug)}">
                ✦ ${escapeHtml(t('ctaCheckin'))}
              </a>
              ${
                isAdmin()
                  ? `<button type="button" class="btn btn-danger admin-delete-btn" data-delete-slug="${escapeHtml(item.slug)}" data-delete-name="${escapeHtml(item.name)}">🗑️ Xóa gánh hàng này</button>`
                  : ''
              }
            </div>
          </div>
        </div>

        <div class="detail-lower-grid">
          <div class="detail-qr-card">
            <h3>${escapeHtml(t('detailQrTitle'))}</h3>
            <p>${escapeHtml(t('detailQrDesc'))}</p>
            <div class="qr-canvas-box">
              <canvas id="detail-qr-canvas" width="200" height="200"></canvas>
            </div>
            <div class="qr-card-actions">
              <button type="button" class="btn btn-primary btn-sm" id="download-detail-qr-btn">
                ⬇️ ${escapeHtml(t('detailDownloadQr'))}
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="copy-detail-link-btn" data-share-slug="${escapeHtml(item.slug)}">
                🔗 ${escapeHtml(t('detailCopyLink'))}
              </button>
            </div>
          </div>

          <div class="detail-history-card">
            <h3>${escapeHtml(t('detailCheckinHistory'))}</h3>
            <div class="detail-checkins-list">
              ${
                checkins.length === 0
                  ? `<p class="muted-text">${state.lang === 'en' ? 'Be the first to check in at this vendor today!' : 'Hãy là người đầu tiên check-in cập nhật cho gánh hàng hôm nay!'}</p>`
                  : checkins
                      .map(
                        (c) => `
                        <div class="checkin-item">
                          <div class="checkin-item-header">
                            <strong>👤 ${escapeHtml(c.user_display_name || c.author_name || 'Bạn đường tử tế')}</strong>
                            <span>${escapeHtml(formatRelativeTime(c.created_at))}</span>
                          </div>
                          <p>${escapeHtml(c.note || 'Đã ghé thăm và xác nhận gánh hàng đang mở bán.')}</p>
                        </div>
                      `
                      )
                      .join('')
              }
            </div>

            <hr class="section-divider" />

            <h4>🚩 ${escapeHtml(t('detailReportTitle'))}</h4>
            <form id="detail-report-form" class="report-form" data-place-slug="${escapeHtml(item.slug)}">
              <div class="form-group">
                <label for="report-reason">${escapeHtml(t('detailReportReason'))}</label>
                <select id="report-reason" name="reason" class="form-select" required>
                  <option value="moved_location">${state.lang === 'en' ? 'Vendor moved to a new spot' : 'Cô chú đã dời sang vị trí khác'}</option>
                  <option value="changed_hours">${state.lang === 'en' ? 'Operating hours changed' : 'Thay đổi khung giờ bán'}</option>
                  <option value="retired">${state.lang === 'en' ? 'Vendor no longer selling' : 'Cô chú đã nghỉ bán hẳn'}</option>
                  <option value="incorrect_info">${state.lang === 'en' ? 'Other information update' : 'Cập nhật thông tin khác'}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="report-note">${escapeHtml(t('detailReportNote'))}</label>
                <textarea id="report-note" name="details" class="form-textarea" rows="2" required placeholder="..."></textarea>
              </div>
              <button type="submit" class="btn btn-secondary btn-sm">${escapeHtml(t('detailReportSubmit'))}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCheckinView() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedSlug = urlParams.get('slug') || (state.places[0] && state.places[0].slug) || '';

  return `
    <section class="page-section">
      <div class="container narrow-container">
        <div class="form-card">
          <div class="form-card-header">
            <span class="badge badge-verified">✦ Check-in Cộng Đồng</span>
            <h1 class="section-title">${escapeHtml(t('checkinPageTitle'))}</h1>
            <p class="section-subtitle">${escapeHtml(t('checkinPageSub'))}</p>
          </div>

          <form id="checkin-submit-form" class="betech-form">
            <div class="form-group">
              <label for="checkin-place-slug">${escapeHtml(t('checkinSelectPlace'))}</label>
              <select id="checkin-place-slug" name="place_slug" class="form-select" required>
                ${state.places
                  .map((p) => {
                    const areaStr = [p.district, p.city].filter(Boolean).join(', ');
                    return `<option value="${escapeHtml(p.slug)}" ${p.slug === preselectedSlug ? 'selected' : ''}>${escapeHtml(p.name)}${areaStr ? ` — ${escapeHtml(areaStr)}` : ''}</option>`;
                  })
                  .join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="checkin-status">${escapeHtml(t('checkinStatusLabel'))}</label>
              <select id="checkin-status" name="status" class="form-select" required>
                <option value="open">${escapeHtml(t('checkinStatusSelling'))}</option>
                <option value="needs_support">${escapeHtml(t('checkinStatusNeedHelp'))}</option>
                <option value="crowded">${escapeHtml(t('checkinStatusCrowded'))}</option>
                <option value="sold_out">${escapeHtml(t('checkinStatusSoldOut'))}</option>
                <option value="closed">${escapeHtml(t('checkinStatusClosed'))}</option>
              </select>
            </div>

            <label class="checkbox-card-label">
              <input type="checkbox" name="supported_purchase" value="1" checked />
              <span>💝 ${escapeHtml(t('checkinBoughtToggle'))}</span>
            </label>

            <div class="form-group">
              <label for="checkin-note">${escapeHtml(t('checkinNoteLabel'))}</label>
              <textarea
                id="checkin-note"
                name="note"
                class="form-textarea"
                rows="3"
                placeholder="${escapeHtml(t('checkinNotePlaceholder'))}"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-block">
              ✦ ${escapeHtml(t('checkinSubmitBtn'))}
            </button>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderAddPlaceView() {
  return `
    <section class="page-section">
      <div class="container narrow-container">
        <div class="form-card">
          <div class="form-card-header">
            <span class="badge badge-category">➕ Gánh Mưu Sinh × Betech Digital</span>
            <h1 class="section-title">${escapeHtml(t('addPlaceTitle'))}</h1>
            <p class="section-subtitle">${escapeHtml(t('addPlaceSub'))}</p>
          </div>

          <form id="add-place-form" class="betech-form">
            <div class="form-group">
              <div class="form-label-row">
                <label for="place-name">Tên gánh *</label>
                <span id="place-name-count" class="char-counter">0/80 ký tự</span>
              </div>
              <input
                type="text"
                id="place-name"
                name="name"
                class="form-input"
                required
                minlength="2"
                maxlength="80"
                placeholder="Ví dụ: Bánh mì cô Hoa"
              />
            </div>

            <div class="form-group">
              <label for="place-category">Loại gánh</label>
              <select id="place-category" name="category_slug" class="form-select">
                <option value="other">Khác / chưa rõ</option>
                <option value="food">Đồ ăn</option>
                <option value="drink">Đồ uống</option>
                <option value="goods">Hàng hóa</option>
                <option value="service">Dịch vụ</option>
              </select>
            </div>

            <fieldset class="place-proposal-location-choice">
              <legend>Chọn cách cung cấp vị trí (bắt buộc)</legend>
              <label class="location-choice-option">
                <input type="radio" name="location_mode" value="pin" checked />
                <div class="location-choice-copy">
                  <strong>Tôi ghim được vị trí</strong>
                  <span>Chọn đúng chỗ bán trên bản đồ hoặc dán liên kết Google Maps.</span>
                </div>
              </label>
              <label class="location-choice-option">
                <input type="radio" name="location_mode" value="address" />
                <div class="location-choice-copy">
                  <strong>Tôi chưa ghim được vị trí</strong>
                  <span>Ghi rõ địa chỉ hoặc khu vực trong mô tả để đội ngũ xác minh.</span>
                </div>
              </label>
            </fieldset>

            <div id="place-pin-section" class="place-pin-section">
              <div class="form-group">
                <label for="place-location-query">Địa chỉ hoặc liên kết Google Maps</label>
                <div class="place-location-search-row">
                  <input
                    type="search"
                    id="place-location-query"
                    class="form-input"
                    maxlength="2048"
                    placeholder="Ví dụ: 123 Nguyễn Trãi, TP.HCM hoặc dán link Google Maps..."
                  />
                  <button type="button" class="btn btn-secondary" id="place-location-search-btn">
                    🔍 Tìm vị trí
                  </button>
                </div>
              </div>

              <div id="place-location-results" class="place-location-results" aria-live="polite"></div>

              <div class="place-pin-map-wrap">
                <div id="add-place-map" class="place-pin-map" role="region" aria-label="Bản đồ ghim vị trí gánh hàng"></div>
                <p id="place-pin-status" class="place-pin-status">
                  Chạm vào bản đồ hoặc tìm địa chỉ / dán link Google Maps ở trên để đặt ghim.
                </p>
              </div>

              <div class="place-pin-tools">
                <button type="button" class="btn btn-secondary btn-sm" id="pin-center-btn">
                  📍 Đặt ghim ở giữa bản đồ
                </button>
                <button type="button" class="btn btn-ghost btn-sm" id="pin-clear-btn">
                  ✖ Bỏ ghim
                </button>
              </div>

              <details class="place-pin-coordinates">
                <summary>Tùy chọn nâng cao · nhập tọa độ</summary>
                <div class="place-pin-coords-body">
                  <div class="form-row-2">
                    <div class="form-group">
                      <label for="place-lat">Vĩ độ</label>
                      <input type="number" id="place-lat" name="lat" class="form-input" step="any" placeholder="10.7769" />
                    </div>
                    <div class="form-group">
                      <label for="place-lng">Kinh độ</label>
                      <input type="number" id="place-lng" name="lng" class="form-input" step="any" placeholder="106.7009" />
                    </div>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" id="apply-coords-btn">
                    Dùng tọa độ này
                  </button>
                </div>
              </details>
            </div>

            <div class="form-group">
              <div class="form-label-row">
                <label for="place-summary">Mô tả / địa chỉ công khai</label>
                <span id="place-summary-count" class="char-counter">0/500 ký tự</span>
              </div>
              <textarea
                id="place-summary"
                name="summary"
                class="form-textarea"
                rows="3"
                maxlength="500"
                placeholder="Gánh bán gì? Địa chỉ công khai hoặc mốc nào dễ tìm?"
              ></textarea>
              <div class="place-proposal-tip">
                💡 <strong>Gợi ý:</strong> Ghi rõ món bán, khung giờ thường đứng và mốc dễ nhận diện (ví dụ: trước cổng trường, đầu hẻm...) để mọi người dễ tìm ghé ủng hộ.
              </div>
            </div>

            <div class="form-group place-proposal-photo">
              <label for="place-photo-file">Ảnh gánh hàng</label>
              <div id="place-photo-preview" class="place-proposal-preview">
                <span class="preview-placeholder">Chưa có ảnh được chọn. Ảnh chụp thực tế giúp cộng đồng dễ nhận ra gánh hàng hơn.</span>
              </div>
              <div class="place-photo-actions">
                <button type="button" class="btn btn-secondary btn-sm" id="place-camera-btn">
                  📷 Chụp ảnh
                </button>
                <button type="button" class="btn btn-secondary btn-sm" id="place-choose-photo-btn">
                  🖼️ Chọn ảnh
                </button>
                <input type="file" id="place-photo-file" accept="image/*" class="form-input-file" />
              </div>
            </div>

            <div class="consent-checks">
              <label class="checkbox-card-label" id="consent-public-wrap">
                <input type="checkbox" id="consent-public" name="consent_public" required />
                <span>Tôi đã hỏi và được người bán tự nguyện đồng ý công khai tên, ảnh và mô tả gánh hàng này.</span>
              </label>

              <label class="checkbox-card-label" id="consent-location-wrap">
                <input type="checkbox" id="consent-location" name="consent_location" required />
                <span>Người bán đồng ý công khai vị trí chính xác của chỗ bán mà tôi đã ghim.</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="submit-place-btn">
              ✨ Gửi gánh mới (+10 điểm)
            </button>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderAccountView() {
  const viewer = state.me || {};
  const displayName = viewer.display_name || viewer.name || 'Người Bạn Đường Tử Tế';
  const points = viewer.total_points ?? viewer.points ?? 185;
  const adminActive = isAdmin();

  return `
    <section class="page-section">
      <div class="container narrow-container">
        <div class="form-card">
          <div class="form-card-header">
            <span class="badge badge-verified">👤 Betech Citizen ID</span>
            <h1 class="section-title">${escapeHtml(t('accountTitle'))}</h1>
            <p class="section-subtitle">${escapeHtml(t('accountSub'))}</p>
          </div>

          <div class="account-stats-banner">
            <div>
              <span class="account-points-label">${escapeHtml(t('accountPoints'))}</span>
              <div class="account-points-value">${Number(points)} pts</div>
            </div>
            <div class="account-badges-list">
              <span class="badge badge-verified">🌱 Người Mở Đường</span>
              <span class="badge badge-support">💝 Bạn Của Gánh Hàng</span>
            </div>
          </div>

          <form id="account-profile-form" class="betech-form">
            <div class="form-group">
              <label for="account-display-name">${escapeHtml(t('accountDisplayName'))}</label>
              <input
                type="text"
                id="account-display-name"
                name="display_name"
                class="form-input"
                value="${escapeHtml(displayName)}"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary">${escapeHtml(t('accountSaveBtn'))}</button>
          </form>
        </div>

        <div class="form-card admin-auth-card">
          <div class="form-card-header">
            <span class="badge badge-category">🛡️ Quản trị hệ thống</span>
            <h2 class="section-title">🔐 Chế độ Quản trị viên (Admin)</h2>
            <p class="section-subtitle">
              ${
                adminActive
                  ? 'Nút 🗑️ Xóa gánh đã được kích hoạt trực tiếp trên tất cả các thẻ gánh hàng ở Trang chủ, Bản đồ và Trang chi tiết.'
                  : 'Đăng nhập tài khoản Admin để bật quyền xóa trực tiếp các gánh hàng không đúng chuẩn trên danh sách và bản đồ.'
              }
            </p>
          </div>

          ${
            adminActive
              ? `
                <div class="admin-status-active-box">
                  <div class="admin-status-title">🛡️ Đang hoạt động với quyền Quản trị viên (Admin)</div>
                  <p class="admin-status-desc">
                    Nút <strong>🗑️ Xóa gánh</strong> đã được kích hoạt trực tiếp trên tất cả các thẻ gánh hàng ở Trang chủ, Bản đồ và Trang chi tiết.
                  </p>
                  <button type="button" class="btn btn-secondary" id="admin-logout-btn">
                    Đăng xuất quyền Admin
                  </button>
                </div>
              `
              : `
                <form id="admin-login-form" class="betech-form" autocomplete="on">
                  <div class="form-group">
                    <label for="admin-username">Tài khoản Admin</label>
                    <input
                      type="text"
                      id="admin-username"
                      name="username"
                      class="form-input"
                      placeholder="Tài khoản Admin (VD: admin)"
                      autocomplete="username"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="admin-password">Mật khẩu Admin</label>
                    <input
                      type="password"
                      id="admin-password"
                      name="password"
                      class="form-input"
                      placeholder="Mật khẩu Admin"
                      autocomplete="current-password"
                      required
                    />
                  </div>
                  <div id="admin-login-error" class="admin-login-error" role="alert" hidden></div>
                  <button type="submit" class="btn btn-primary" id="admin-login-btn">
                    🔐 Đăng nhập Admin
                  </button>
                </form>
              `
          }
        </div>
      </div>
    </section>
  `;
}

function renderPrivacyView() {
  return `
    <section class="page-section">
      <div class="container narrow-container">
        <div class="form-card prose-card">
          <span class="badge badge-verified">🛡️ Betech Digital Trust & Safety</span>
          <h1 class="section-title">${escapeHtml(t('privacyTitle'))}</h1>
          <p class="section-subtitle">${escapeHtml(t('privacySub'))}</p>

          <div class="privacy-content">
            <h3>1. ${state.lang === 'en' ? 'Respecting Vendor Dignity & Consent' : 'Tôn trọng phẩm giá và sự đồng thuận của cô chú bán hàng'}</h3>
            <p>
              ${
                state.lang === 'en'
                  ? 'Gánh Mưu Sinh only shares public selling locations and stories with goodwill to help community members find and support street vendors. Any vendor can request removal or modification at any time.'
                  : 'Gánh Mưu Sinh chỉ chia sẻ điểm bán và câu chuyện mưu sinh với thiện chí kết nối cộng đồng ghé mua ủng hộ. Bất kỳ cô chú nào không muốn xuất hiện trên bản đồ đều được gỡ bỏ ngay lập tức khi có yêu cầu.'
              }
            </p>
            <h3>2. ${state.lang === 'en' ? 'No Commercial Exploitation' : 'Phi lợi nhuận & Không thu phí trung gian'}</h3>
            <p>
              ${
                state.lang === 'en'
                  ? 'Powered by Betech Digital CSR, 100% of transactions happen directly between passersby and street vendors without commissions or fees.'
                  : 'Được vận hành bởi chương trình Trách nhiệm Xã hội của Betech Digital, 100% giao dịch mua ủng hộ diễn ra trực tiếp giữa người đi đường và cô chú bán hàng.'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer" role="contentinfo">
      <div class="container footer-grid">
        <div class="footer-brand-col">
          <div class="footer-logos">
            <img src="/images/logo-betech.png" alt="Betech Digital" class="footer-betech-logo" width="142" height="40" />
          </div>
          <p class="footer-mission">${escapeHtml(t('footerAbout'))}</p>
        </div>

        <div class="footer-links-col">
          <h4>${escapeHtml(t('footerQuickLinks'))}</h4>
          <ul>
            <li><a href="${buildUrl('/')}" data-nav="/">${escapeHtml(t('navExplore'))}</a></li>
            <li><a href="${buildUrl('/map')}" data-nav="/map">${escapeHtml(t('navMap'))}</a></li>
            <li><a href="${buildUrl('/checkin')}" data-nav="/checkin">${escapeHtml(t('ctaCheckin'))}</a></li>
            <li><a href="${buildUrl('/add-place')}" data-nav="/add-place">${escapeHtml(t('navAddPlace'))}</a></li>
            <li><a href="${buildUrl('/leaderboard')}" data-nav="/leaderboard">${escapeHtml(t('navLeaderboard'))}</a></li>
            <li><a href="${buildUrl('/privacy')}" data-nav="/privacy">${escapeHtml(t('navPrivacy'))}</a></li>
          </ul>
        </div>

        <div class="footer-company-col">
          <h4>${escapeHtml(t('footerCompanyTitle'))}</h4>
          <p class="company-name">${escapeHtml(t('footerCompanyName'))}</p>
          <p>${escapeHtml(t('footerAddress'))}</p>
          <p>Hotline: <a href="tel:0962299224">0962 299 224</a> • Email: <a href="mailto:contact@betech-digital.com">contact@betech-digital.com</a></p>
          <p>Website: <a href="https://betech-digital.com/" target="_blank" rel="noopener noreferrer">https://betech-digital.com/</a></p>
        </div>
      </div>

      <div class="container footer-bottom">
        <span>${escapeHtml(t('footerCopyright'))}</span>
        <span>Betech Digital Design System • Vibrant Tech Orange</span>
      </div>
    </footer>

    <nav class="mobile-bottom-bar" aria-label="Bottom Navigation">
      <a href="${buildUrl('/')}" class="bottom-tab ${state.route === '/' ? 'active' : ''}" data-nav="/">
        <span>🧭</span>
        <span>${escapeHtml(t('navExplore'))}</span>
      </a>
      <a href="${buildUrl('/map')}" class="bottom-tab ${state.route === '/map' ? 'active' : ''}" data-nav="/map">
        <span>🗺️</span>
        <span>${escapeHtml(t('navMap'))}</span>
      </a>
      <a href="${buildUrl('/checkin')}" class="bottom-tab bottom-tab-cta ${state.route === '/checkin' ? 'active' : ''}" data-nav="/checkin">
        <span>✦</span>
        <span>Check-in</span>
      </a>
      <a href="${buildUrl('/add-place')}" class="bottom-tab ${state.route === '/add-place' ? 'active' : ''}" data-nav="/add-place">
        <span>➕</span>
        <span>${escapeHtml(t('navAddPlace'))}</span>
      </a>
      <a href="${buildUrl('/account')}" class="bottom-tab ${state.route === '/account' ? 'active' : ''}" data-nav="/account">
        <span>👤</span>
        <span>${escapeHtml(t('navProfile'))}</span>
      </a>
    </nav>

    <dialog id="qr-modal-dialog" class="qr-dialog">
      <div class="qr-dialog-inner">
        <div class="qr-dialog-header">
          <h3 id="qr-modal-title">Mã QR Gánh Mưu Sinh</h3>
          <button type="button" class="dialog-close-btn" id="close-qr-modal-btn" aria-label="Close">✕</button>
        </div>
        <p id="qr-modal-subtitle" class="qr-dialog-sub"></p>
        <div class="qr-canvas-box">
          <canvas id="modal-qr-canvas" width="220" height="220"></canvas>
        </div>
        <div class="qr-dialog-actions">
          <button type="button" class="btn btn-primary btn-sm" id="modal-download-qr-btn">⬇️ ${escapeHtml(t('detailDownloadQr'))}</button>
          <button type="button" class="btn btn-secondary btn-sm" id="modal-copy-link-btn">🔗 ${escapeHtml(t('detailCopyLink'))}</button>
        </div>
      </div>
    </dialog>
  `;
}

function closeAdminDeleteModal() {
  state.pendingDeleteSlug = null;
  state.pendingDeleteName = '';
  const existing = document.getElementById('admin-delete-modal');
  if (existing) existing.remove();
}

function openAdminDeleteModal(slug, name) {
  if (!slug || !isAdmin()) return;
  const resolvedName =
    name ||
    state.places.find((p) => p.slug === slug)?.name ||
    state.currentDetail?.name ||
    slug;
  state.pendingDeleteSlug = slug;
  state.pendingDeleteName = resolvedName;

  const existing = document.getElementById('admin-delete-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-delete-modal';
  modal.className = 'admin-modal-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'admin-delete-modal-title');
  modal.innerHTML = `
    <div class="admin-modal-card">
      <div class="admin-modal-header">
        <span class="badge badge-soldout">⚠️ Cảnh báo xóa dữ liệu</span>
        <h3 id="admin-delete-modal-title">Xác nhận xóa gánh hàng</h3>
      </div>
      <p class="admin-modal-body">
        Bạn có chắc chắn muốn xóa vĩnh viễn gánh hàng <strong>"${escapeHtml(resolvedName)}"</strong> khỏi hệ thống không? Hành động này không thể hoàn tác.
      </p>
      <div class="admin-modal-actions">
        <button type="button" class="btn btn-secondary" id="cancel-delete-place-btn">
          Hủy bỏ
        </button>
        <button type="button" class="btn btn-danger" id="confirm-delete-place-btn" data-confirm-delete-slug="${escapeHtml(slug)}">
          🗑️ Xác nhận xóa vĩnh viễn
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAdminDeleteModal();
    }
  });

  const cancelBtn = document.getElementById('cancel-delete-place-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeAdminDeleteModal();
    });
  }

  const confirmBtn = document.getElementById('confirm-delete-place-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Đang xóa...';
      try {
        try {
          await fetchJson('/api/livelihoods/' + encodeURIComponent(slug) + '/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
          });
        } catch (err) {
          if (err && (err.status === 401 || err.status === 403)) {
            throw err;
          }
          await fetchJson('/api/livelihoods/' + encodeURIComponent(slug), {
            method: 'DELETE'
          });
        }

        state.places = state.places.filter((p) => p.slug !== slug && p.id !== slug);
        state.feed = state.feed.filter((f) => f.place_slug !== slug && f.slug !== slug);
        if (state.selectedMapSlug === slug) {
          const firstWithPin = state.places.find((p) => p.has_pin) || state.places[0];
          state.selectedMapSlug = firstWithPin ? firstWithPin.slug : null;
        }
        if (state.currentDetail && (state.currentDetail.slug === slug || state.currentDetail.id === slug)) {
          state.currentDetail = null;
        }

        closeAdminDeleteModal();
        showToast('🗑️ Đã xóa gánh hàng khỏi hệ thống!');

        if (state.route.startsWith('/ganh/')) {
          await navigateTo(buildUrl('/'), true);
        } else {
          await renderApp();
        }
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '🗑️ Xác nhận xóa vĩnh viễn';
        showToast(err?.message || 'Không thể xóa gánh hàng (cần quyền Admin).');
      }
    });
  }
}

function bindAdminDeleteTriggers(root = document) {
  root.querySelectorAll('[data-delete-slug]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const slug = btn.getAttribute('data-delete-slug');
      const name = btn.getAttribute('data-delete-name') || '';
      if (slug) {
        openAdminDeleteModal(slug, name);
      }
    });
  });
}

function selectPlaceOnMapView(slug, fly = true) {
  state.selectedMapSlug = slug;
  const activePlace = state.places.find((p) => p.slug === slug);
  if (!activePlace) return;

  document.querySelectorAll('.map-list-card').forEach((card) => {
    card.classList.toggle('active', card.getAttribute('data-map-select') === slug);
  });

  document.querySelectorAll('.betech-map-marker').forEach((m) => {
    m.classList.toggle('active', m.getAttribute('data-marker-slug') === slug);
  });

  const popupHost = document.getElementById('map-popup-host');
  if (popupHost) {
    popupHost.innerHTML = renderMapPlacePopup(activePlace);
    popupHost.querySelectorAll('a[data-nav]').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        const href = link.getAttribute('href') || link.getAttribute('data-nav') || '/';
        navigateTo(href, true);
      });
    });
    bindAdminDeleteTriggers(popupHost);
  }

  if (fly && state.mapInstance && activePlace.has_pin && activePlace.lat != null && activePlace.lng != null) {
    try {
      state.mapInstance.flyTo({
        center: [Number(activePlace.lng), Number(activePlace.lat)],
        zoom: 15,
        essential: true
      });
    } catch {
      // ignore
    }
  }
}

async function initMapLibreIfNeeded() {
  if (state.route !== '/map') return;
  const container = document.getElementById('maplibre-canvas');
  if (!container) return;

  const filtered = getFilteredPlaces();
  const pinnedPlaces = filtered.filter((p) => p.has_pin && p.lat != null && p.lng != null);
  const selectedPlace =
    state.places.find((p) => p.slug === state.selectedMapSlug) ||
    pinnedPlaces[0] ||
    filtered[0] ||
    state.places[0];

  const centerLng = selectedPlace?.has_pin && selectedPlace?.lng != null ? Number(selectedPlace.lng) : 106.7009;
  const centerLat = selectedPlace?.has_pin && selectedPlace?.lat != null ? Number(selectedPlace.lat) : 10.7769;
  const mapStyle = state.config?.map_style_url || 'https://tiles.openfreemap.org/styles/liberty';

  try {
    const map = new maplibregl.Map({
      container,
      style: mapStyle,
      center: [centerLng, centerLat],
      zoom: selectedPlace?.has_pin ? 15 : 13
    });

    state.mapInstance = map;
    state.mapMarkers = [];

    pinnedPlaces.forEach((place) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `betech-map-marker ${selectedPlace && place.slug === selectedPlace.slug ? 'active' : ''}`;
      el.setAttribute('data-marker-slug', place.slug);
      el.innerHTML = `<span>${CATEGORY_LABELS[place.category_slug]?.icon || '🍜'}</span>`;
      el.title = place.name;
      el.addEventListener('click', () => {
        selectPlaceOnMapView(place.slug, true);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([Number(place.lng), Number(place.lat)])
        .addTo(map);
      state.mapMarkers.push(marker);
    });

    if (selectedPlace?.has_pin && selectedPlace.lat != null && selectedPlace.lng != null) {
      map.flyTo({
        center: [Number(selectedPlace.lng), Number(selectedPlace.lat)],
        zoom: 15,
        essential: true
      });
    }
  } catch {
    container.innerHTML = `
      <div class="map-fallback-box">
        <h4>🗺️ ${escapeHtml(selectedPlace?.name || 'Bản đồ Gánh Mưu Sinh')}</h4>
        <p>📍 ${escapeHtml(selectedPlace?.address_text || '')}</p>
      </div>
    `;
  }
}

function setAddPlacePin(lat, lng, sourceLabel = '', shouldFly = true) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return;

  state.addPlacePin = { lat: numLat, lng: numLng };

  const latInput = document.getElementById('place-lat');
  const lngInput = document.getElementById('place-lng');
  const statusEl = document.getElementById('place-pin-status');

  if (latInput) latInput.value = numLat.toFixed(6);
  if (lngInput) lngInput.value = numLng.toFixed(6);
  if (statusEl) {
    statusEl.textContent = `📍 Đã đặt ghim tại: ${numLat.toFixed(5)}, ${numLng.toFixed(5)}${sourceLabel ? ` · ${sourceLabel}` : ''}`;
  }

  if (state.addPlaceMapInstance) {
    if (!state.addPlaceMarker) {
      const marker = new maplibregl.Marker({ color: '#bc7c18', draggable: true })
        .setLngLat([numLng, numLat])
        .addTo(state.addPlaceMapInstance);

      marker.on('dragend', () => {
        const pos = marker.getLngLat();
        setAddPlacePin(pos.lat, pos.lng, 'Đã kéo ghim trên bản đồ', false);
      });
      state.addPlaceMarker = marker;
    } else {
      state.addPlaceMarker.setLngLat([numLng, numLat]);
    }

    if (shouldFly) {
      try {
        state.addPlaceMapInstance.flyTo({
          center: [numLng, numLat],
          zoom: 16,
          essential: true
        });
      } catch {
        // ignore
      }
    }
  }
}

function clearAddPlacePin() {
  state.addPlacePin = null;
  if (state.addPlaceMarker) {
    state.addPlaceMarker.remove();
    state.addPlaceMarker = null;
  }
  const latInput = document.getElementById('place-lat');
  const lngInput = document.getElementById('place-lng');
  const statusEl = document.getElementById('place-pin-status');
  if (latInput) latInput.value = '';
  if (lngInput) lngInput.value = '';
  if (statusEl) {
    statusEl.textContent = 'Đã bỏ ghim. Chạm vào bản đồ hoặc tìm vị trí để đặt ghim mới.';
  }
}

async function initAddPlaceMapIfNeeded() {
  if (state.route !== '/add-place') return;
  const container = document.getElementById('add-place-map');
  if (!container) return;

  state.addPlaceMarker = null;
  state.addPlaceMapInstance = null;
  const mapStyle = state.config?.map_style_url || 'https://tiles.openfreemap.org/styles/liberty';

  try {
    const map = new maplibregl.Map({
      container,
      style: mapStyle,
      center: [106.7009, 10.7769],
      zoom: 13
    });

    state.addPlaceMapInstance = map;

    map.on('click', (e) => {
      if (e.lngLat) {
        setAddPlacePin(e.lngLat.lat, e.lngLat.lng, 'Đã chọn trên bản đồ', false);
      }
    });
  } catch {
    container.innerHTML = `
      <div class="map-fallback-box">
        <p>Bản đồ tương tác sẵn sàng nhận tọa độ ghim.</p>
      </div>
    `;
  }
}

async function renderDetailQrIfNeeded() {
  if (!state.route.startsWith('/ganh/')) return;
  const canvas = document.getElementById('detail-qr-canvas');
  const item = state.currentDetail || state.places[0];
  if (!canvas || !item) return;
  const shareUrl = `${window.location.origin}/ganh/${encodeURIComponent(item.slug)}?lang=${state.lang}`;
  try {
    await QRCode.toCanvas(canvas, shareUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#111927', light: '#FFF7F2' }
    });
  } catch {
    // fallback
  }
}

async function openQrModal(slug) {
  const place = state.places.find((p) => p.slug === slug) || state.currentDetail;
  if (!place) return;
  const dialog = document.getElementById('qr-modal-dialog');
  const titleEl = document.getElementById('qr-modal-title');
  const subEl = document.getElementById('qr-modal-subtitle');
  const canvas = document.getElementById('modal-qr-canvas');
  if (!dialog || !canvas) return;

  titleEl.textContent = place.name;
  subEl.textContent = `📍 ${place.address_text}`;
  const shareUrl = `${window.location.origin}/ganh/${encodeURIComponent(place.slug)}?lang=${state.lang}`;

  try {
    await QRCode.toCanvas(canvas, shareUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#111927', light: '#FFF7F2' }
    });
  } catch {
    // ignore
  }

  dialog.dataset.shareUrl = shareUrl;
  dialog.dataset.slug = place.slug;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', 'open');
  }
}

export async function navigateTo(urlStr, push = true) {
  const url = new URL(urlStr, window.location.origin);
  const langParam = url.searchParams.get('lang');
  if (langParam === 'en' || langParam === 'vi') {
    state.lang = langParam;
  }
  const slugParam = url.searchParams.get('slug');
  if (slugParam) {
    state.selectedMapSlug = slugParam;
  }
  state.route = url.pathname || '/';
  state.mobileDrawerOpen = false;
  closeAdminDeleteModal();

  if (push) {
    window.history.pushState({}, '', url.pathname + url.search);
  }

  if (state.route.startsWith('/ganh/')) {
    const slug = decodeURIComponent(state.route.replace('/ganh/', ''));
    await loadLivelihoodDetail(slug);
  }

  await renderApp();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export async function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  document.documentElement.lang = state.lang;

  let mainHtml = '';
  if (state.route === '/map') {
    mainHtml = renderMapView();
  } else if (state.route === '/leaderboard') {
    mainHtml = renderLeaderboardView();
  } else if (state.route.startsWith('/ganh/')) {
    mainHtml = renderDetailView();
  } else if (state.route === '/checkin') {
    mainHtml = renderCheckinView();
  } else if (state.route === '/add-place') {
    mainHtml = renderAddPlaceView();
  } else if (state.route === '/account') {
    mainHtml = renderAccountView();
  } else if (state.route === '/privacy') {
    mainHtml = renderPrivacyView();
  } else {
    mainHtml = renderDirectoryView();
  }

  root.innerHTML = `
    ${renderHeader()}
    <main id="main-content" class="main-content" role="main">
      ${mainHtml}
    </main>
    ${renderFooter()}
  `;

  bindInteractiveEvents();
  await initMapLibreIfNeeded();
  await initAddPlaceMapIfNeeded();
  await renderDetailQrIfNeeded();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImageToDataUrl(file, maxDim = 1280, quality = 0.84) {
  const rawDataUrl = await readFileAsDataUrl(file);
  if (!rawDataUrl || typeof document === 'undefined') {
    return rawDataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => resolve(rawDataUrl), 2500);
    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const origW = img.naturalWidth || img.width || 0;
        const origH = img.naturalHeight || img.height || 0;
        if (!origW || !origH) {
          resolve(rawDataUrl);
          return;
        }
        let targetW = origW;
        let targetH = origH;
        if (origW > maxDim || origH > maxDim) {
          if (origW >= origH) {
            targetW = maxDim;
            targetH = Math.max(1, Math.round((origH * maxDim) / origW));
          } else {
            targetH = maxDim;
            targetW = Math.max(1, Math.round((origW * maxDim) / origH));
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        let compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed || !compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }
        if (compressed && compressed.length > 32 && compressed.length < rawDataUrl.length) {
          resolve(compressed);
        } else {
          resolve(compressed && compressed.length > 32 ? compressed : rawDataUrl);
        }
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(rawDataUrl);
    };
    img.src = rawDataUrl;
  });
}

function bindInteractiveEvents() {
  // Language switchers
  document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang-switch');
      if (targetLang === 'vi' || targetLang === 'en') {
        state.lang = targetLang;
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('lang', targetLang);
        window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
        renderApp();
      }
    });
  });

  // SPA navigation links
  document.querySelectorAll('a[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const navTarget = link.getAttribute('data-nav') || link.getAttribute('href') || '/';
      const href = link.getAttribute('href') || navTarget;
      const targetUrl = navTarget.includes('?') ? navTarget : href;
      navigateTo(targetUrl, true);
    });
  });

  // Admin delete triggers across cards, map, and detail page
  bindAdminDeleteTriggers(document);

  // Mobile menu button
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      state.mobileDrawerOpen = !state.mobileDrawerOpen;
      renderApp();
    });
  }

  // Directory search & filters
  const searchInput = document.getElementById('directory-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.q = e.target.value;
      renderApp().then(() => {
        const refocused = document.getElementById('directory-search-input');
        if (refocused) {
          refocused.focus();
          refocused.setSelectionRange(refocused.value.length, refocused.value.length);
        }
      });
    });
  }

  const citySelect = document.getElementById('filter-city');
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      state.filters.city = e.target.value;
      renderApp();
    });
  }

  const catSelect = document.getElementById('filter-category');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderApp();
    });
  }

  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      renderApp();
    });
  }

  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      renderApp();
    });
  }

  document.querySelectorAll('[data-cat-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filters.category = chip.getAttribute('data-cat-chip') || '';
      renderApp();
    });
  });

  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filters = { q: '', city: '', category: '', status: '', sort: 'verified' };
      renderApp();
    });
  }

  // Map filters & selection
  const mapSearch = document.getElementById('map-search-input');
  if (mapSearch) {
    mapSearch.addEventListener('input', (e) => {
      state.filters.q = e.target.value;
      renderApp();
    });
  }

  const mapCat = document.getElementById('map-category-select');
  if (mapCat) {
    mapCat.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderApp();
    });
  }

  document.querySelectorAll('[data-map-fly], [data-map-select]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('a[data-nav]') || e.target.closest('[data-delete-slug]')) return;
      e.stopPropagation();
      const slug = el.getAttribute('data-map-fly') || el.getAttribute('data-map-select');
      if (slug) {
        selectPlaceOnMapView(slug, true);
      }
    });
  });

  // QR modal triggers
  document.querySelectorAll('[data-open-qr], [data-qr-slug]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-qr-slug') || btn.getAttribute('data-open-qr');
      openQrModal(slug);
    });
  });

  const closeQrBtn = document.getElementById('close-qr-modal-btn');
  if (closeQrBtn) {
    closeQrBtn.addEventListener('click', () => {
      const dialog = document.getElementById('qr-modal-dialog');
      if (dialog && typeof dialog.close === 'function') dialog.close();
      else if (dialog) dialog.removeAttribute('open');
    });
  }

  const modalCopyBtn = document.getElementById('modal-copy-link-btn');
  if (modalCopyBtn) {
    modalCopyBtn.addEventListener('click', () => {
      const dialog = document.getElementById('qr-modal-dialog');
      const url = dialog?.dataset.shareUrl || window.location.href;
      navigator.clipboard?.writeText(url).catch(() => {});
      showToast(t('copiedToast'));
    });
  }

  const modalDownloadBtn = document.getElementById('modal-download-qr-btn');
  if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener('click', () => {
      const canvas = document.getElementById('modal-qr-canvas');
      if (!canvas) return;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'ganh-muu-sinh-qr.png';
      a.click();
    });
  }

  // Detail page QR buttons
  const detailCopyBtn = document.getElementById('copy-detail-link-btn');
  if (detailCopyBtn) {
    detailCopyBtn.addEventListener('click', () => {
      const slug = detailCopyBtn.getAttribute('data-share-slug');
      const shareUrl = `${window.location.origin}/ganh/${encodeURIComponent(slug)}?lang=${state.lang}`;
      navigator.clipboard?.writeText(shareUrl).catch(() => {});
      showToast(t('copiedToast'));
    });
  }

  const detailDownloadBtn = document.getElementById('download-detail-qr-btn');
  if (detailDownloadBtn) {
    detailDownloadBtn.addEventListener('click', () => {
      const canvas = document.getElementById('detail-qr-canvas');
      if (!canvas) return;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'ganh-muu-sinh-qr.png';
      a.click();
    });
  }

  // Checkin form submission
  const checkinForm = document.getElementById('checkin-submit-form');
  if (checkinForm) {
    checkinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(checkinForm);
      const slugVal = fd.get('place_slug');
      const payload = {
        slug: slugVal,
        place_slug: slugVal,
        status: fd.get('status') || 'bought',
        supported_purchase: fd.get('supported_purchase') ? 1 : 0,
        caption: fd.get('note'),
        note: fd.get('note')
      };
      try {
        await fetchJson('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await loadInitialData();
        showToast(t('checkinSuccessToast'));
        navigateTo(buildUrl(`/ganh/${encodeURIComponent(slugVal)}`));
      } catch {
        showToast(t('checkinSuccessToast'));
      }
    });
  }

  // Add place form interactive events
  const addPlaceForm = document.getElementById('add-place-form');
  if (addPlaceForm) {
    state.uploadedPhotoFile = null;
    state.uploadedPhotoDataUrl = '';
    state.addPlaceLocationLabel = '';
    state.addPlaceGoogleMapsUrl = '';

    const nameInput = document.getElementById('place-name');
    const nameCount = document.getElementById('place-name-count');
    if (nameInput && nameCount) {
      nameInput.addEventListener('input', () => {
        nameCount.textContent = `${nameInput.value.length}/80 ký tự`;
      });
    }

    const summaryInput = document.getElementById('place-summary');
    const summaryCount = document.getElementById('place-summary-count');
    if (summaryInput && summaryCount) {
      summaryInput.addEventListener('input', () => {
        summaryCount.textContent = `${summaryInput.value.length}/500 ký tự`;
      });
    }

    // Location mode radio toggle (pin vs address)
    const locationModeRadios = addPlaceForm.querySelectorAll('input[name="location_mode"]');
    const pinSection = document.getElementById('place-pin-section');
    const consentLocationWrap = document.getElementById('consent-location-wrap');
    const consentLocationInput = document.getElementById('consent-location');

    locationModeRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        const mode = addPlaceForm.querySelector('input[name="location_mode"]:checked')?.value || 'pin';
        const isPin = mode === 'pin';
        if (pinSection) {
          pinSection.hidden = !isPin;
        }
        if (consentLocationWrap) {
          consentLocationWrap.hidden = !isPin;
        }
        if (consentLocationInput) {
          consentLocationInput.required = isPin;
        }
        if (isPin && state.addPlaceMapInstance) {
          setTimeout(() => state.addPlaceMapInstance.resize(), 60);
        }
      });
    });

    // Search location via POST /api/place-location
    const queryInput = document.getElementById('place-location-query');
    const searchBtn = document.getElementById('place-location-search-btn');
    const resultsContainer = document.getElementById('place-location-results');

    const runLocationSearch = async () => {
      const q = (queryInput?.value || '').trim();
      if (!q || !resultsContainer) return;
      resultsContainer.innerHTML = `<p class="location-searching-msg">Đang tìm vị trí...</p>`;

      try {
        const resData = await fetchJson('/api/place-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, business_location: true })
        });

        const rawItems = Array.isArray(resData.results)
          ? resData.results
          : Array.isArray(resData.items)
          ? resData.items
          : resData && resData.lat != null && resData.lng != null
          ? [resData]
          : [];

        state.addPlaceLocationResults = rawItems;

        if (rawItems.length === 0) {
          resultsContainer.innerHTML = `<p class="location-empty-msg">Không tìm thấy vị trí phù hợp. Bạn có thể chạm trực tiếp lên bản đồ để đặt ghim.</p>`;
          return;
        }

        resultsContainer.innerHTML = rawItems
          .map((item, idx) => {
            const label = item.label || item.name || item.address || `${item.lat}, ${item.lng}`;
            const sourceBadge =
              item.source === 'google_maps_link' || resData.source === 'google_maps_link'
                ? 'Liên kết Google Maps'
                : 'Địa chỉ gợi ý';
            return `
              <div class="place-pin-result" data-result-index="${idx}">
                <div class="place-pin-result-info">
                  <span class="place-pin-result-badge">${escapeHtml(sourceBadge)}</span>
                  <strong>${escapeHtml(label)}</strong>
                  <small>${Number(item.lat).toFixed(5)}, ${Number(item.lng).toFixed(5)}</small>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm select-pin-result-btn"
                  data-select-loc-idx="${idx}"
                >
                  Chọn vị trí này
                </button>
              </div>
            `;
          })
          .join('');

        const applyResultItem = (item) => {
          if (!item) return;
          const label = item.label || item.name || item.address || q;
          state.addPlaceLocationLabel = label;
          if (/^https?:\/\//i.test(q)) {
            state.addPlaceGoogleMapsUrl = q;
          }
          setAddPlacePin(item.lat, item.lng, label, true);
        };

        resultsContainer.querySelectorAll('[data-select-loc-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-select-loc-idx'));
            applyResultItem(rawItems[idx]);
          });
        });

        // Auto-pin when result comes from a Google Maps link
        if (
          resData.source === 'google_maps_link' ||
          rawItems[0]?.source === 'google_maps_link' ||
          /^https?:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(q)
        ) {
          applyResultItem(rawItems[0]);
        }
      } catch {
        resultsContainer.innerHTML = `<p class="location-empty-msg">Không thể tra cứu tự động lúc này. Hãy chạm trực tiếp vào bản đồ để đặt ghim.</p>`;
      }
    };

    if (searchBtn) {
      searchBtn.addEventListener('click', runLocationSearch);
    }
    if (queryInput) {
      queryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          runLocationSearch();
        }
      });
    }

    // Quick map pin tools
    const pinCenterBtn = document.getElementById('pin-center-btn');
    if (pinCenterBtn) {
      pinCenterBtn.addEventListener('click', () => {
        if (state.addPlaceMapInstance) {
          const c = state.addPlaceMapInstance.getCenter();
          setAddPlacePin(c.lat, c.lng, 'Giữa bản đồ', false);
        } else {
          setAddPlacePin(10.7769, 106.7009, 'Giữa bản đồ', false);
        }
      });
    }

    const pinClearBtn = document.getElementById('pin-clear-btn');
    if (pinClearBtn) {
      pinClearBtn.addEventListener('click', () => {
        clearAddPlacePin();
      });
    }

    const applyCoordsBtn = document.getElementById('apply-coords-btn');
    if (applyCoordsBtn) {
      applyCoordsBtn.addEventListener('click', () => {
        const latVal = parseFloat(document.getElementById('place-lat')?.value || '');
        const lngVal = parseFloat(document.getElementById('place-lng')?.value || '');
        if (Number.isFinite(latVal) && Number.isFinite(lngVal)) {
          setAddPlacePin(latVal, lngVal, 'Tọa độ nhập tay', true);
        }
      });
    }

    // Photo preview & buttons
    const fileInput = document.getElementById('place-photo-file');
    const cameraBtn = document.getElementById('place-camera-btn');
    const choosePhotoBtn = document.getElementById('place-choose-photo-btn');
    const previewBox = document.getElementById('place-photo-preview');

    if (cameraBtn && fileInput) {
      cameraBtn.addEventListener('click', () => {
        fileInput.setAttribute('capture', 'environment');
        fileInput.click();
      });
    }
    if (choosePhotoBtn && fileInput) {
      choosePhotoBtn.addEventListener('click', () => {
        fileInput.removeAttribute('capture');
        fileInput.click();
      });
    }
    if (fileInput && previewBox) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        state.uploadedPhotoFile = file;
        try {
          const dataUrl = await compressImageToDataUrl(file);
          state.uploadedPhotoDataUrl = dataUrl;
          previewBox.innerHTML = `
            <img src="${escapeHtml(dataUrl)}" alt="Xem trước ảnh gánh hàng" class="place-preview-img" />
            <span class="preview-filename">${escapeHtml(file.name)}</span>
          `;
        } catch {
          // ignore
        }
      });
    }

    addPlaceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(addPlaceForm);
      const locationMode = fd.get('location_mode') || 'pin';
      const latRaw = document.getElementById('place-lat')?.value;
      const lngRaw = document.getElementById('place-lng')?.value;

      let lat = null;
      let lng = null;
      if (locationMode === 'pin') {
        lat = latRaw !== '' && latRaw != null ? Number(latRaw) : state.addPlacePin?.lat ?? 10.7769;
        lng = lngRaw !== '' && lngRaw != null ? Number(lngRaw) : state.addPlacePin?.lng ?? 106.7009;
      }

      let mediaId = null;
      let uploadedCoverUrl = null;
      const selectedFile = fileInput?.files?.[0] || state.uploadedPhotoFile;
      if (selectedFile || state.uploadedPhotoDataUrl) {
        try {
          const dataUrl =
            state.uploadedPhotoDataUrl ||
            (selectedFile ? await compressImageToDataUrl(selectedFile) : '');
          if (dataUrl) {
            const mimeMatch = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
            const contentType = mimeMatch ? mimeMatch[1] : selectedFile?.type || 'image/webp';
            const uploadRes = await fetchJson('/api/place-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                data_url: dataUrl,
                filename: selectedFile?.name || 'place-photo.webp',
                content_type: contentType
              })
            });
            mediaId = uploadRes?.media_id || uploadRes?.id || null;
            uploadedCoverUrl =
              uploadRes?.cover_photo_url || uploadRes?.photo_url || uploadRes?.url || null;
          }
        } catch {
          // continue submission even if upload fails
        }
      }

      const summaryText = String(fd.get('summary') || '').trim();
      const addressLabel =
        state.addPlaceLocationLabel ||
        (document.getElementById('place-location-query')?.value || '').trim() ||
        summaryText;

      const payload = {
        name: String(fd.get('name') || '').trim(),
        category: fd.get('category_slug') || 'other',
        category_slug: fd.get('category_slug') || 'other',
        location_mode: locationMode,
        description: summaryText,
        summary: summaryText,
        address: addressLabel,
        address_text: addressLabel,
        google_maps_url: state.addPlaceGoogleMapsUrl || null,
        lat,
        lng,
        media_id: mediaId,
        cover_photo_url: uploadedCoverUrl,
        consent_public: true,
        consent_location: locationMode === 'pin'
      };

      try {
        const result = await fetchJson('/api/place-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await loadInitialData();
        showToast(t('addPlaceSuccessToast'));
        const newSlug = result?.slug || result?.item?.slug || state.places[0]?.slug || '';
        navigateTo(newSlug ? buildUrl(`/ganh/${encodeURIComponent(newSlug)}`) : buildUrl('/'));
      } catch {
        showToast(t('addPlaceSuccessToast'));
      }
    });
  }

  // Report form submission
  const reportForm = document.getElementById('detail-report-form');
  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(reportForm);
      const slug = reportForm.getAttribute('data-place-slug');
      try {
        await fetchJson('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            livelihood_id: slug,
            place_slug: slug,
            kind: fd.get('reason'),
            reason: fd.get('details') || fd.get('reason')
          })
        });
        reportForm.reset();
        showToast(t('reportSuccessToast'));
      } catch {
        showToast(t('reportSuccessToast'));
      }
    });
  }

  // Account profile form
  const accountForm = document.getElementById('account-profile-form');
  if (accountForm) {
    accountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(accountForm);
      try {
        const res = await fetchJson('/api/me/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_name: fd.get('display_name') })
        });
        const updatedMe = res.volunteer || res.viewer || res || {};
        state.me = {
          ...updatedMe,
          is_admin: Boolean(res.is_admin || updatedMe.is_admin || state.adminToken)
        };
        showToast(t('profileSavedToast'));
        renderApp();
      } catch {
        showToast(t('profileSavedToast'));
      }
    });
  }

  // Admin login form
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(adminLoginForm);
      const username = String(fd.get('username') || '').trim();
      const password = String(fd.get('password') || '');
      const errorBox = document.getElementById('admin-login-error');
      const submitBtn = document.getElementById('admin-login-btn');
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetchJson('/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (res && res.ok) {
          state.adminToken = res.admin_token || 'admin-session';
          try {
            localStorage.setItem('gms_admin_token', state.adminToken);
          } catch {
            // ignore
          }
          state.me = { ...(state.me || {}), is_admin: true };
          showToast(
            '🛡️ Đã bật chế độ Admin! Bạn có thể xóa các gánh hàng không hợp lệ trực tiếp trên danh sách.'
          );
          await renderApp();
        } else {
          throw new Error(res?.error || 'Sai tài khoản hoặc mật khẩu Admin!');
        }
      } catch (err) {
        if (submitBtn) submitBtn.disabled = false;
        const msg = err?.data?.error || 'Sai tài khoản hoặc mật khẩu Admin!';
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.textContent = `❌ ${msg}`;
        }
        showToast('Sai tài khoản hoặc mật khẩu Admin!');
      }
    });
  }

  // Admin logout button
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async () => {
      try {
        await fetchJson('/auth/admin-logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch {
        // ignore
      }
      state.adminToken = '';
      try {
        localStorage.removeItem('gms_admin_token');
      } catch {
        // ignore
      }
      if (state.me) {
        state.me.is_admin = false;
        if (state.me.volunteer) {
          state.me.volunteer.is_admin = false;
        }
      }
      closeAdminDeleteModal();
      showToast('Đã đăng xuất quyền Admin');
      await renderApp();
    });
  }
}

window.addEventListener('popstate', async () => {
  const url = new URL(window.location.href);
  state.lang = url.searchParams.get('lang') === 'en' ? 'en' : 'vi';
  const slugParam = url.searchParams.get('slug');
  if (slugParam) {
    state.selectedMapSlug = slugParam;
  }
  state.route = url.pathname || '/';
  closeAdminDeleteModal();
  if (state.route.startsWith('/ganh/')) {
    const slug = decodeURIComponent(state.route.replace('/ganh/', ''));
    await loadLivelihoodDetail(slug);
  }
  await renderApp();
});

async function bootstrap() {
  await loadInitialData();
  if (state.route.startsWith('/ganh/')) {
    const slug = decodeURIComponent(state.route.replace('/ganh/', ''));
    await loadLivelihoodDetail(slug);
  }
  await renderApp();
}

bootstrap();
