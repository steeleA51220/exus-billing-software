/**
 * ============================================================================
 * NEXUS BILLING SOFTWARE - INTERNATIONALIZATION (i18n) ENGINE
 * File: src/renderer/js/i18n.js
 * ============================================================================
 * Supports 3 language modes:
 *   1. 'ta_en' — தமிழ் + English (Bilingual, default)
 *   2. 'ta'    — தமிழ் மட்டும் (Tamil Only)
 *   3. 'en'    — English Only
 * ============================================================================
 */

'use strict';

const i18n = {
  currentLang: 'ta_en',

  translations: {
    // ── Navigation ───────────────────────────────────────────────────────────
    'nav.dashboard': {
      ta_en: 'முகப்பு (Dashboard)',
      ta: 'முகப்பு',
      en: 'Dashboard'
    },
    'nav.billing': {
      ta_en: 'புதிய பில் (New Bill)',
      ta: 'புதிய பில்',
      en: 'New Bill'
    },
    'nav.products': {
      ta_en: 'பொருட்கள் (Products)',
      ta: 'பொருட்கள்',
      en: 'Products'
    },
    'nav.customers': {
      ta_en: 'வாடிக்கையாளர்கள் (Customers)',
      ta: 'வாடிக்கையாளர்கள்',
      en: 'Customers'
    },
    'nav.purchases': {
      ta_en: 'கொள்முதல் (Purchases)',
      ta: 'கொள்முதல்',
      en: 'Purchases'
    },
    'nav.reports': {
      ta_en: 'அறிக்கைகள் (Reports)',
      ta: 'அறிக்கைகள்',
      en: 'Reports'
    },
    'nav.settings': {
      ta_en: 'அமைப்புகள் (Settings)',
      ta: 'அமைப்புகள்',
      en: 'Settings'
    },
    'nav.lock': {
      ta_en: 'பூட்டு (Lock)',
      ta: 'பூட்டு',
      en: 'Lock Screen'
    },

    // ── Header & Common ──────────────────────────────────────────────────────
    'header.fy': {
      ta_en: 'நிதியாண்டு: ',
      ta: 'நிதியாண்டு: ',
      en: 'FY: '
    },
    'common.save': {
      ta_en: 'சேமி (Save)',
      ta: 'சேமி',
      en: 'Save'
    },
    'common.cancel': {
      ta_en: 'ரத்து (Cancel)',
      ta: 'ரத்து',
      en: 'Cancel'
    },
    'common.close': {
      ta_en: 'மூடு (Close)',
      ta: 'மூடு',
      en: 'Close'
    },
    'common.search': {
      ta_en: 'தேடு (Search)',
      ta: 'தேடு',
      en: 'Search'
    },
    'common.actions': {
      ta_en: 'செயல்கள் (Actions)',
      ta: 'செயல்கள்',
      en: 'Actions'
    },
    'common.all': {
      ta_en: 'அனைத்தும் (All)',
      ta: 'அனைத்தும்',
      en: 'All'
    },
    'common.date': {
      ta_en: 'தேதி (Date)',
      ta: 'தேதி',
      en: 'Date'
    },
    'common.total': {
      ta_en: 'மொத்தம் (Total)',
      ta: 'மொத்தம்',
      en: 'Total'
    },

    // ── Dashboard ────────────────────────────────────────────────────────────
    'dash.today_sales': {
      ta_en: 'இன்றைய விற்பனை (Today Sales)',
      ta: 'இன்றைய விற்பனை',
      en: "Today's Sales"
    },
    'dash.today_collection': {
      ta_en: 'இன்றைய வசூல் (Today Collection)',
      ta: 'இன்றைய வசூல்',
      en: "Today's Collection"
    },
    'dash.today_due': {
      ta_en: 'இன்றைய பாக்கி (Today Due)',
      ta: 'இன்றைய பாக்கி',
      en: "Today's Due"
    },
    'dash.low_stock': {
      ta_en: 'குறைந்த இருப்பு எச்சரிக்கைகள் (Low Stock Alerts)',
      ta: 'குறைந்த இருப்பு எச்சரிக்கைகள்',
      en: 'Low Stock Alerts'
    },
    'dash.quick_actions': {
      ta_en: 'விரைவு பொத்தான்கள் (Quick Actions)',
      ta: 'விரைவு பொத்தான்கள்',
      en: 'Quick Actions'
    },
    'dash.new_bill_btn': {
      ta_en: '⚡ புதிய பில் (New Bill F2)',
      ta: '⚡ புதிய பில் (F2)',
      en: '⚡ New Bill (F2)'
    },
    'dash.new_purchase_btn': {
      ta_en: '📦 புதிய கொள்முதல் (New Purchase)',
      ta: '📦 புதிய கொள்முதல்',
      en: '📦 New Purchase'
    },
    'dash.agri_stmt_btn': {
      ta_en: '🏛️ அரசு அறிக்கை (Agri Statement)',
      ta: '🏛️ அரசு அறிக்கை',
      en: '🏛️ Agri Statement'
    },
    'dash.monthly_chart': {
      ta_en: 'மாதாந்திர விற்பனை வரைபடம் (Monthly Sales)',
      ta: 'மாதாந்திர விற்பனை வரைபடம்',
      en: 'Monthly Sales Chart'
    },
    'dash.top_products': {
      ta_en: 'இந்த மாத அதிகம் விற்ற பூச்சிமருந்துகள் (Top Products)',
      ta: 'அதிகம் விற்ற பூச்சிமருந்துகள்',
      en: 'Top Selling Products This Month'
    },

    // ── Billing View ─────────────────────────────────────────────────────────
    'bill.customer_sec': {
      ta_en: '1. வாடிக்கையாளர் விவரம் (Customer Details)',
      ta: '1. வாடிக்கையாளர் விவரம்',
      en: '1. Customer Details'
    },
    'bill.cust_search_ph': {
      ta_en: '🔍 வாடிக்கையாளர் பெயர் / போன் தேடவும் (F4)...',
      ta: '🔍 வாடிக்கையாளர் பெயர் / போன் தேடவும்...',
      en: '🔍 Search customer by name or phone (F4)...'
    },
    'bill.walkin': {
      ta_en: 'பொது வாடிக்கையாளர் (Walk-in)',
      ta: 'பொது வாடிக்கையாளர்',
      en: 'Walk-in Customer'
    },
    'bill.add_cust_btn': {
      ta_en: '+ புதிய வாடிக்கையாளர் (+ Add Customer)',
      ta: '+ புதிய வாடிக்கையாளர்',
      en: '+ New Customer'
    },
    'bill.prod_sec': {
      ta_en: '2. மருந்து / விதை தேடல் (Product Search)',
      ta: '2. மருந்து / விதை தேடல்',
      en: '2. Product Search'
    },
    'bill.prod_search_ph': {
      ta_en: '🔍 மருந்து பெயர் / விதை / HSN தட்டச்சு செய்யவும் (F4)...',
      ta: '🔍 மருந்து பெயர் / விதை / HSN தட்டச்சு செய்யவும்...',
      en: '🔍 Type product name, seed or HSN (F4)...'
    },
    'bill.th_sno': {
      ta_en: 'வ.எண் (S.No)',
      ta: 'வ.எண்',
      en: 'S.No'
    },
    'bill.th_product': {
      ta_en: 'பொருள் பெயர் (Product)',
      ta: 'பொருள் பெயர்',
      en: 'Product Name'
    },
    'bill.th_size': {
      ta_en: 'அளவு (Size)',
      ta: 'அளவு',
      en: 'Size'
    },
    'bill.th_qty': {
      ta_en: 'எண்ணிக்கை (Qty)',
      ta: 'எண்ணிக்கை',
      en: 'Qty'
    },
    'bill.th_rate': {
      ta_en: 'விலை ₹ (Rate)',
      ta: 'விலை ₹',
      en: 'Rate ₹'
    },
    'bill.th_disc': {
      ta_en: 'தள்ளுபடி % (Disc)',
      ta: 'தள்ளுபடி %',
      en: 'Disc %'
    },
    'bill.th_taxable': {
      ta_en: 'வரி மதிப்பு (Taxable)',
      ta: 'வரி மதிப்பு',
      en: 'Taxable'
    },
    'bill.th_gst': {
      ta_en: 'GST %',
      ta: 'GST %',
      en: 'GST %'
    },
    'bill.th_total': {
      ta_en: 'மொத்தம் ₹ (Total)',
      ta: 'மொத்தம் ₹',
      en: 'Total ₹'
    },
    'bill.summary_sec': {
      ta_en: '3. பில் சுருக்கம் (Bill Summary)',
      ta: '3. பில் சுருக்கம்',
      en: '3. Bill Summary'
    },
    'bill.subtotal': {
      ta_en: 'வரிக்கு முந்தைய மதிப்பு (Subtotal):',
      ta: 'வரிக்கு முந்தைய மதிப்பு:',
      en: 'Subtotal:'
    },
    'bill.cgst': {
      ta_en: 'மத்திய வரி (CGST):',
      ta: 'மத்திய வரி (CGST):',
      en: 'CGST:'
    },
    'bill.sgst': {
      ta_en: 'மாநில வரி (SGST):',
      ta: 'மாநில வரி (SGST):',
      en: 'SGST:'
    },
    'bill.roundoff': {
      ta_en: 'சமப்படுத்துதல் (Round-off):',
      ta: 'சமப்படுத்துதல்:',
      en: 'Round-off:'
    },
    'bill.grand_total': {
      ta_en: 'மொத்த தொகை (Grand Total):',
      ta: 'மொத்த தொகை:',
      en: 'Grand Total:'
    },
    'bill.payment_mode': {
      ta_en: 'செலுத்தும் முறை (Payment Mode)',
      ta: 'செலுத்தும் முறை',
      en: 'Payment Mode'
    },
    'bill.cash': {
      ta_en: 'ரொக்கம் (Cash)',
      ta: 'ரொக்கம்',
      en: 'Cash'
    },
    'bill.upi': {
      ta_en: 'UPI / QR',
      ta: 'UPI / QR',
      en: 'UPI / QR'
    },
    'bill.card': {
      ta_en: 'கார்டு (Card)',
      ta: 'கார்டு',
      en: 'Card'
    },
    'bill.credit': {
      ta_en: 'கடன் (Credit / Due)',
      ta: 'கடன்',
      en: 'Credit / Due'
    },
    'bill.paid_amt': {
      ta_en: 'செலுத்திய தொகை ₹ (Paid)',
      ta: 'செலுத்திய தொகை ₹',
      en: 'Paid Amount ₹'
    },
    'bill.due_amt': {
      ta_en: 'மீதி பாக்கி ₹ (Due)',
      ta: 'மீதி பாக்கி ₹',
      en: 'Balance Due ₹'
    },
    'bill.save_btn': {
      ta_en: '💾 பில் சேமிக்க (Save Bill)',
      ta: '💾 பில் சேமிக்க',
      en: '💾 Save Bill'
    },
    'bill.save_print_btn': {
      ta_en: '🖨️ சேமி & பிரிண்ட் (Save & Print F9)',
      ta: '🖨️ சேமி & பிரிண்ட் (F9)',
      en: '🖨️ Save & Print (F9)'
    },
    'bill.clear_btn': {
      ta_en: 'புதிய பில் (Clear / New Bill)',
      ta: 'புதிய பில்',
      en: 'Clear / New Bill'
    },

    // ── Products View ────────────────────────────────────────────────────────
    'prod.search_ph': {
      ta_en: '🔍 மருந்து / விதை பெயர் அல்லது HSN தேடவும்...',
      ta: '🔍 மருந்து / விதை பெயர் அல்லது HSN தேடவும்...',
      en: '🔍 Search product name or HSN...'
    },
    'prod.filter_all': {
      ta_en: 'அனைத்து பிரிவுகள் (All Categories)',
      ta: 'அனைத்து பிரிவுகள்',
      en: 'All Categories'
    },
    'prod.filter_pesticide': {
      ta_en: 'பூச்சிமருந்து (Pesticides)',
      ta: 'பூச்சிமருந்து',
      en: 'Pesticides'
    },
    'prod.filter_seed': {
      ta_en: 'விதை (Seeds)',
      ta: 'விதை',
      en: 'Seeds'
    },
    'prod.filter_fertilizer': {
      ta_en: 'உரம் (Fertilizers)',
      ta: 'உரம்',
      en: 'Fertilizers'
    },
    'prod.filter_low_stock': {
      ta_en: '⚠️ குறைந்த இருப்பு மட்டும் (Low Stock Only)',
      ta: '⚠️ குறைந்த இருப்பு மட்டும்',
      en: '⚠️ Low Stock Only'
    },
    'prod.add_btn': {
      ta_en: '+ புதிய பொருள் சேர்க்க (Add Product)',
      ta: '+ புதிய பொருள் சேர்க்க',
      en: '+ Add Product'
    },
    'prod.import_csv_btn': {
      ta_en: '📥 CSV இறக்குமதி (Bulk Import CSV)',
      ta: '📥 CSV இறக்குமதி',
      en: '📥 Bulk Import CSV'
    },
    'prod.th_code': {
      ta_en: 'குறியீடு (Code)',
      ta: 'குறியீடு',
      en: 'Code'
    },
    'prod.th_name': {
      ta_en: 'பொருள் பெயர் (Product Name)',
      ta: 'பொருள் பெயர்',
      en: 'Product Name'
    },
    'prod.th_category': {
      ta_en: 'பிரிவு (Category)',
      ta: 'பிரிவு',
      en: 'Category'
    },
    'prod.th_hsn': {
      ta_en: 'HSN எண்',
      ta: 'HSN எண்',
      en: 'HSN Code'
    },
    'prod.th_purchase_price': {
      ta_en: 'கொள்முதல் ₹ (Purchase)',
      ta: 'கொள்முதல் ₹',
      en: 'Purchase Price ₹'
    },
    'prod.th_selling_price': {
      ta_en: 'விற்பனை ₹ (Selling)',
      ta: 'விற்பனை ₹',
      en: 'Selling Price ₹'
    },
    'prod.th_stock': {
      ta_en: 'தற்போதைய இருப்பு (Stock)',
      ta: 'தற்போதைய இருப்பு',
      en: 'Current Stock'
    },

    // ── Customers View ───────────────────────────────────────────────────────
    'cust.search_ph': {
      ta_en: '🔍 வாடிக்கையாளர் பெயர், போன் அல்லது ஊர் தேடவும்...',
      ta: '🔍 வாடிக்கையாளர் பெயர், போன் அல்லது ஊர் தேடவும்...',
      en: '🔍 Search customer by name, phone or village...'
    },
    'cust.add_btn': {
      ta_en: '+ புதிய வாடிக்கையாளர் (+ Add Customer)',
      ta: '+ புதிய வாடிக்கையாளர்',
      en: '+ Add Customer'
    },
    'cust.th_name': {
      ta_en: 'பெயர் (Name)',
      ta: 'பெயர்',
      en: 'Customer Name'
    },
    'cust.th_phone': {
      ta_en: 'தொலைபேசி (Phone)',
      ta: 'தொலைபேசி',
      en: 'Phone Number'
    },
    'cust.th_village': {
      ta_en: 'கிராமம் / ஊர் (Village)',
      ta: 'கிராமம் / ஊர்',
      en: 'Village / City'
    },
    'cust.th_balance': {
      ta_en: 'தற்போதைய பாக்கி ₹ (Balance)',
      ta: 'தற்போதைய பாக்கி ₹',
      en: 'Current Balance ₹'
    },
    'cust.btn_ledger': {
      ta_en: '📖 கணக்கு ஏடு (Ledger)',
      ta: '📖 கணக்கு ஏடு',
      en: '📖 Ledger'
    },
    'cust.btn_payment': {
      ta_en: '💵 பாக்கி வசூல் (Receive Payment)',
      ta: '💵 பாக்கி வசூல்',
      en: '💵 Receive Payment'
    },

    // ── Purchases View ───────────────────────────────────────────────────────
    'pur.search_ph': {
      ta_en: '🔍 பில் எண் அல்லது சப்ளையர் பெயர் தேடவும்...',
      ta: '🔍 பில் எண் அல்லது சப்ளையர் பெயர் தேடவும்...',
      en: '🔍 Search bill no or supplier...'
    },
    'pur.new_inward_btn': {
      ta_en: '+ புதிய கொள்முதல் வரவு (+ New Stock Inward)',
      ta: '+ புதிய கொள்முதல் வரவு',
      en: '+ New Stock Inward'
    },
    'pur.add_supplier_btn': {
      ta_en: '+ சப்ளையர் சேர்க்க (+ Add Supplier)',
      ta: '+ சப்ளையர் சேர்க்க',
      en: '+ Add Supplier'
    },
    'pur.th_bill_no': {
      ta_en: 'கொள்முதல் பில் எண் (Bill No)',
      ta: 'கொள்முதல் பில் எண்',
      en: 'Purchase Bill No'
    },
    'pur.th_supplier': {
      ta_en: 'சப்ளையர் பெயர் (Supplier)',
      ta: 'சப்ளையர் பெயர்',
      en: 'Supplier Name'
    },
    'pur.th_items_count': {
      ta_en: 'பொருட்கள் (Items)',
      ta: 'பொருட்கள்',
      en: 'Items'
    },

    // ── Reports View ─────────────────────────────────────────────────────────
    'rep.tab_agri': {
      ta_en: '🏛️ அரசு அறிக்கை (Agri Dept Statement)',
      ta: '🏛️ அரசு அறிக்கை',
      en: '🏛️ Agri Dept Statement'
    },
    'rep.tab_daybook': {
      ta_en: '📅 விற்பனை குறிப்பேடு (Sales Day Book)',
      ta: '📅 விற்பனை குறிப்பேடு',
      en: '📅 Sales Day Book'
    },
    'rep.tab_gstr1': {
      ta_en: '📑 GST அறிக்கை (GSTR-1 Summary)',
      ta: '📑 GST அறிக்கை',
      en: '📑 GSTR-1 Summary'
    },
    'rep.tab_stock': {
      ta_en: '📦 இருப்பு மதிப்பு (Stock Valuation)',
      ta: '📦 இருப்பு மதிப்பு',
      en: '📦 Stock Valuation'
    },
    'rep.tab_outstanding': {
      ta_en: '👥 பாக்கி அறிக்கை (Customer Outstanding)',
      ta: '👥 பாக்கி அறிக்கை',
      en: '👥 Customer Outstanding'
    },
    'rep.btn_pesticide_pdf': {
      ta_en: 'பூச்சிமருந்து அறிக்கை (Pesticide PDF)',
      ta: 'பூச்சிமருந்து அறிக்கை',
      en: 'Pesticide Report (PDF)'
    },
    'rep.btn_seed_pdf': {
      ta_en: 'விதை அறிக்கை (Seed PDF)',
      ta: 'விதை அறிக்கை',
      en: 'Seed Report (PDF)'
    },
    'rep.btn_fertilizer_pdf': {
      ta_en: 'உரம் அறிக்கை (Fertilizer PDF)',
      ta: 'உரம் அறிக்கை',
      en: 'Fertilizer Report (PDF)'
    },

    // ── Settings View ────────────────────────────────────────────────────────
    'set.shop_details': {
      ta_en: '🏪 கடை விவரங்கள் (Shop Details)',
      ta: '🏪 கடை விவரங்கள்',
      en: '🏪 Shop Details'
    },
    'set.shop_name_label': {
      ta_en: 'கடையின் பெயர் (Shop Name - Tamil & English)',
      ta: 'கடையின் பெயர்',
      en: 'Shop Name'
    },
    'set.tagline_label': {
      ta_en: 'விளம்பர வாசகம் (Tagline)',
      ta: 'விளம்பர வாசகம்',
      en: 'Tagline'
    },
    'set.address_label': {
      ta_en: 'முகவரி (Address)',
      ta: 'முகவரி',
      en: 'Address'
    },
    'set.gstin_label': {
      ta_en: 'GSTIN எண்',
      ta: 'GSTIN எண்',
      en: 'GSTIN'
    },
    'set.phone_label': {
      ta_en: 'தொலைபேசி (Phone)',
      ta: 'தொலைபேசி',
      en: 'Phone'
    },
    'set.prefix_label': {
      ta_en: 'பில் முன்னொட்டு (Bill Prefix)',
      ta: 'பில் முன்னொட்டு',
      en: 'Bill Prefix'
    },
    'set.fy_label': {
      ta_en: 'நிதியாண்டு (Financial Year)',
      ta: 'நிதியாண்டு',
      en: 'Financial Year'
    },
    'set.printer_label': {
      ta_en: 'இயல்புநிலை பிரிண்டர் (Default Print Size)',
      ta: 'இயல்புநிலை பிரிண்டர்',
      en: 'Default Print Size'
    },
    'set.a4_print': {
      ta_en: '📄 A4 தாள் பிரிண்ட் (Standard GST)',
      ta: '📄 A4 தாள் பிரிண்ட்',
      en: '📄 A4 Paper Print (Standard GST)'
    },
    'set.thermal_print': {
      ta_en: '🧾 80mm தெர்மல் பில் (Thermal POS)',
      ta: '🧾 80mm தெர்மல் பில்',
      en: '🧾 80mm Thermal POS'
    },
    'set.save_btn': {
      ta_en: '💾 விவரங்களை சேமிக்கவும் (Save Shop Details)',
      ta: '💾 விவரங்களை சேமிக்கவும்',
      en: '💾 Save Shop Details'
    },
    'set.logo_title': {
      ta_en: '🖼️ பில் லோகோ (Invoice Logo)',
      ta: '🖼️ பில் லோகோ',
      en: '🖼️ Invoice Logo'
    },
    'set.select_logo': {
      ta_en: '📁 கணினியிலிருந்து லோகோ தேர்ந்தெடுக்கவும் (Select Logo)',
      ta: '📁 கணினியிலிருந்து லோகோ தேர்ந்தெடுக்கவும்',
      en: '📁 Select Logo from Computer'
    },
    'set.pin_title': {
      ta_en: '🔐 கடவுச்சொல் மாற்றம் (Change PIN)',
      ta: '🔐 கடவுச்சொல் மாற்றம்',
      en: '🔐 Change Security PIN'
    },
    'set.cur_pin': {
      ta_en: 'தற்போதைய PIN (Current PIN)',
      ta: 'தற்போதைய PIN',
      en: 'Current PIN'
    },
    'set.new_pin': {
      ta_en: 'புதிய PIN (New PIN)',
      ta: 'புதிய PIN',
      en: 'New PIN'
    },
    'set.confirm_pin': {
      ta_en: 'உறுதிப்படுத்தவும் (Confirm New PIN)',
      ta: 'உறுதிப்படுத்தவும்',
      en: 'Confirm New PIN'
    },
    'set.update_pin_btn': {
      ta_en: '🔑 PIN மாற்றவும் (Update Security PIN)',
      ta: '🔑 PIN மாற்றவும்',
      en: '🔑 Update Security PIN'
    },
    'set.backup_title': {
      ta_en: '💾 தரவுத்தள மேலாண்மை (Backup & Restore)',
      ta: '💾 தரவுத்தள மேலாண்மை',
      en: '💾 Database Backup & Restore'
    },
    'set.backup_btn': {
      ta_en: '📥 காப்புப்பிரதி எடுக்கவும் (Backup Database .db)',
      ta: '📥 காப்புப்பிரதி எடுக்கவும்',
      en: '📥 Backup Database (.db)'
    },
    'set.restore_btn': {
      ta_en: '⚠️ முந்தைய காப்புப்பிரதியை மீட்டெடுக்க (Restore Database)',
      ta: '⚠️ முந்தைய காப்புப்பிரதியை மீட்டெடுக்க',
      en: '⚠️ Restore Previous Backup'
    },
    'set.lang_title': {
      ta_en: '🌐 மொழி அமைப்புகள் (Language Settings)',
      ta: '🌐 மொழி அமைப்புகள்',
      en: '🌐 Language Settings'
    },
    'set.about_title': {
      ta_en: 'ℹ️ மென்பொருள் தகவல் (About Software)',
      ta: 'ℹ️ மென்பொருள் தகவல்',
      en: 'ℹ️ About Software'
    },
    'set.about_btn': {
      ta_en: 'ℹ️ மென்பொருள் பற்றி (About Software)',
      ta: 'ℹ️ மென்பொருள் பற்றி',
      en: 'ℹ️ About Software'
    },

    // ── Overlays ─────────────────────────────────────────────────────────────
    'auth.lock_subtitle': {
      ta_en: 'வணிக அமைப்பில் நுழைய PIN எண்ணை உள்ளிடவும் (Enter PIN to unlock)',
      ta: 'வணிக அமைப்பில் நுழைய PIN எண்ணை உள்ளிடவும்',
      en: 'Enter PIN to unlock software'
    },
    'auth.initial_pin_hint': {
      ta_en: 'ஆரம்ப PIN: 1234 (அமைப்புகளில் மாற்றிக்கொள்ளலாம்)',
      ta: 'ஆரம்ப PIN: 1234',
      en: 'Default PIN: 1234 (can be changed in settings)'
    },
    'setup.title': {
      ta_en: 'முதல் முறை அமைப்பு: கடை பதிவு (First-Time Shop Registration)',
      ta: 'முதல் முறை அமைப்பு: கடை பதிவு',
      en: 'First-Time Setup: Register Shop'
    },
    'setup.save_btn': {
      ta_en: '💾 சேமித்து தொடரவும் (Save & Continue) →',
      ta: '💾 சேமித்து தொடரவும் →',
      en: '💾 Save & Continue →'
    }
  },

  /**
   * Initialize Language System
   */
  init() {
    // Read from localStorage (fast offline access) or default to ta_en
    const saved = localStorage.getItem('nexus_language');
    if (saved && (saved === 'ta_en' || saved === 'ta' || saved === 'en')) {
      this.currentLang = saved;
    } else {
      this.currentLang = 'ta_en';
    }

    this.applyTranslations();
  },

  /**
   * Translate a key into the active language
   */
  t(key, fallback = '') {
    const item = this.translations[key];
    if (!item) return fallback || key;
    return item[this.currentLang] || item.ta_en || fallback || key;
  },

  /**
   * Switch Language (persists to localStorage and updates UI immediately)
   */
  setLanguage(lang) {
    if (lang !== 'ta_en' && lang !== 'ta' && lang !== 'en') return;
    this.currentLang = lang;
    localStorage.setItem('nexus_language', lang);

    this.applyTranslations();

    // Notify any dynamic page elements (charts, headers)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  /**
   * Apply translations to all DOM elements marked with data-i18n attributes
   */
  applyTranslations() {
    // 1. Text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && this.translations[key]) {
        el.textContent = this.t(key);
      }
    });

    // 2. Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && this.translations[key]) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // 3. Titles / Tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key && this.translations[key]) {
        el.setAttribute('title', this.t(key));
      }
    });

    // Update active highlight on settings language cards
    const langOpts = document.querySelectorAll('.lang-option');
    langOpts.forEach(opt => {
      if (opt.getAttribute('data-lang') === this.currentLang) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });

    // Update page title if App is loaded
    if (window.App && window.App.updatePageTitle) {
      window.App.updatePageTitle();
    }
  }
};

// Initialize as soon as script loads
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => i18n.init());
    } else {
      i18n.init();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
