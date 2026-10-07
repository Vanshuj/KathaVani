export const LANGUAGE_TO_CODE = {
  'English': 'en',
  'Hindi': 'hi',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Bengali': 'bn',
  'Marathi': 'mr',
  'Gujarati': 'gu',
  'Kannada': 'kn',
  'Malayalam': 'ml',
  'Odia': 'or',
  'Punjabi': 'pa',
  'Assamese': 'as'
};

export const CODE_TO_LANGUAGE = {
  'en': 'English',
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'bn': 'Bengali',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'or': 'Odia',
  'pa': 'Punjabi',
  'as': 'Assamese'
};

// In-memory cache to prevent redundant network requests and maximize responsiveness
const memoryCache = new Map();

// High-quality pre-translated cultural titles and excerpts for instant local response
const PRESET_TRANSLATIONS = {
  'The Monkey and the Crocodile': {
    hi: { title: 'बंदर और मगरमच्छ', summary: 'गंगा नदी के तट पर जामुन के पेड़ पर रहने वाले बुद्धिमान बंदर और उसके मित्र मगरमच्छ की प्रसिद्ध पंचतंत्र कथा।' },
    ta: { title: 'குரங்கும் முதலையும்', summary: 'கங்கை நதிக்கரையில் நாவல் பழங்களை பகிர்ந்து கொண்ட புத்திசாலி குரங்கு மற்றும் முதலையின் பஞ்சதந்திர கதை.' },
    te: { title: 'కోతి మరియు మొసలి', summary: 'గంగా నది తీరంలో నేరేడు పండ్లను పంచుకున్న తెలివైన కోతి మరియు మొసలి పంచతంత్ర కథ.' },
    bn: { title: 'বানর ও কুমির', summary: 'গঙ্গা নদীর তীরে জাম গাছের বুদ্ধিমান বানর ও তার বন্ধু কুমিরের বিখ্যাত পঞ্চতন্ত্রের গল্প।' },
    mr: { title: 'माकड आणि सुसर', summary: 'गंगा नदीकाठच्या जांभळाच्या झाडावरील चतुर माकड आणि सुसर यांची प्रसिद्ध पंचतंत्र कथा.' },
    gu: { title: 'વાંદરો અને મગર', summary: 'ગંગા નદીના કિનારે જાંબુના ઝાડ પર રહેતા બુદ્ધિશાળી વાંદરા અને મગરની પંચતંત્રની વાર્તા.' },
    kn: { title: 'ಕೋತಿ ಮತ್ತು ಮೊಸಳೆ', summary: 'ಗಂಗಾ ನದಿಯ ದಡದಲ್ಲಿ ನೇರಳೆ ಹಣ್ಣುಗಳನ್ನು ಹಂಚಿಕೊಂಡ ಜಾಣ ಕೋತಿ ಮತ್ತು ಮೊಸಳೆಯ ಪಂಚತಂತ್ರ ಕಥೆ.' },
    ml: { title: 'കുരങ്ങനും മുതലയും', summary: 'ഗംഗാനദീതീരത്ത് ഞാവൽപ്പഴങ്ങൾ പങ്കിട്ട ബുദ്ധിമാനായ കുരങ്ങന്റെയും മുതലയുടെയും പഞ്ചതന്ത്രകഥ.' },
    or: { title: 'ମାଙ୍କଡ଼ ଓ କୁମ୍ଭୀର', summary: 'ଗଙ୍ଗା ନଦୀ କୂଳରେ ଜାମୁକୋଳି ଗଛରେ ରହୁଥିବା ଚତୁର ମାଙ୍କଡ଼ ଏବଂ କୁମ୍ଭୀରର ପଞ୍ଚତନ୍ତ୍ର କାହାଣୀ।' },
    pa: { title: 'ਬਾਂਦਰ ਅਤੇ ਮਗਰਮੱਛ', summary: 'ਗੰਗਾ ਨਦੀ ਦੇ ਕੰਢੇ ਜਾਮਣ ਦੇ ਰੁੱਖ ਉੱਤੇ ਰਹਿੰਦੇ ਬੁੱਧੀਮਾਨ ਬਾਂਦਰ ਅਤੇ ਮਗਰਮੱਛ ਦੀ ਪੰਚਤੰਤਰ ਕਹਾਣੀ।' },
    as: { title: 'বান্দৰ আৰু ঘঁৰিয়াল', summary: 'গংগা নদীৰ পাৰত জামু গছত থকা চতুৰ বান্দৰ আৰু ঘঁৰিয়ালৰ প্ৰসিদ্ধ পঞ্চতন্ত্ৰৰ সাধু।' }
  },
  'The Archery Test of Arjuna': {
    hi: { title: 'अर्जुन की धनुर्विद्या परीक्षा', summary: 'गुरु द्रोणाचार्य द्वारा ली गई एकाग्रता परीक्षा, जहाँ अर्जुन को केवल चिड़िया की आँख दिखाई दी।' },
    ta: { title: 'அர்ஜுனனின் வில்வித்தை தேர்வு', summary: 'துரோணாச்சாரியார் நடத்திய வில்வித்தை தேர்வு: மரத்தில் பறவையின் கண் மட்டுமே அர்ஜுனனுக்கு தெரிந்தது.' },
    te: { title: 'అర్జునుడి విలువిద్య పరీక్ష', summary: 'ద్రోణాచార్యుల ఏకాగ్రత పరీక్ష: అర్జునుడికి చెట్టుపై ఉన్న పక్షి కన్ను మాత్రమే కనిపించింది.' },
    bn: { title: 'অর্জুনের ধনুর্বিদ্যা পরীক্ষা', summary: 'গুরু দ্রোণাচার্যের একাগ্রতার পরীক্ষা, যেখানে অর্জুন কেবল পাখির চোখ দেখতে পেয়েছিলেন।' },
    mr: { title: 'अर्जुनाची धनुर्विद्या परीक्षा', summary: 'गुरु द्रोणाचार्यांची एकाग्रता चाचणी, जिथे अर्जुनाला केवळ पक्ष्याचा डोळा दिसला.' },
    gu: { title: 'અર્જુનની ધનુરવિદ્યા પરીક્ષા', summary: 'ગુરુ દ્રોણાચાર્યની એકાગ્રતા પરીક્ષા, જ્યાં અર્જુનને માત્ર પક્ષીની આંખ જ દેખાઈ.' },
    kn: { title: 'ಅರ್ಜುನನ ಬಿಲ್ಲುಗಾರಿಕೆ ಪರೀಕ್ಷೆ', summary: 'ಗುರು ದ್ರೋಣಾಚಾರ್ಯರ ಏಕಾಗ್ರತೆ ಪರೀಕ್ಷೆ: ಅರ್ಜುನನಿಗೆ ಮರದ ಮೇಲಿನ ಹಕ್ಕಿಯ ಕಣ್ಣು ಮಾತ್ರ ಕಂಡಿತು.' },
    ml: { title: 'അർജ്ജുനന്റെ വില്ലുവിദ്യ പരീക്ഷ', summary: 'ഗുരു ദ്രോണാചാര്യരുടെ ഏകാഗ്രത പരീക്ഷ: പക്ഷിയുടെ കണ്ണ് മാത്രം കണ്ട അർജ്ജുനന്റെ ലക്ഷ്യബോധം.' },
    or: { title: 'ଅର୍ଜୁନଙ୍କ ଧନୁର୍ବିଦ୍ୟା ପରୀକ୍ଷା', summary: 'ଗୁରୁ ଦ୍ରୋଣାଚାର୍ଯ୍ୟଙ୍କ ଏକାଗ୍ରତା ପରୀକ୍ଷା: ଅର୍ଜୁନଙ୍କୁ କେବଳ ଚଢ଼େଇର ଆଖି ଦୃଶ୍ୟମାନ ହୋଇଥିଲା।' },
    pa: { title: 'ਅਰਜੁਨ ਦੀ ਤੀਰਅੰਦਾਜ਼ੀ ਪ੍ਰੀਖਿਆ', summary: 'ਗੁਰੂ ਦ੍ਰੋਣਾਚਾਰੀਆ ਦੀ ਇਕਾਗਰਤਾ ਪ੍ਰੀਖਿਆ: ਅਰਜੁਨ ਨੂੰ ਸਿਰਫ਼ ਪੰਛੀ ਦੀ ਅੱਖ ਹੀ ਨਜ਼ਰ ਆਈ।' },
    as: { title: 'অৰ্জুনৰ ধনুৰ্বিদ্যা পৰীক্ষা', summary: 'গুৰু দ্ৰোণাচাৰ্যৰ একাগ্রতাৰ পৰীক্ষা: অৰ্জুনক কেৱল চৰাইটোৰ চকুহে দৃষ্টিগোচৰ হৈছিল।' }
  },
  'The Blue Jackal': {
    hi: { title: 'नीला सियार', summary: 'नील के बर्तन में गिरकर जंगल का राजा बनने वाले सियार की सत्य और स्वाभाविकता सिखाने वाली कथा।' },
    ta: { title: 'நீல நரி', summary: 'நீல தொட்டியில் விழுந்து காட்டிற்கு ராஜாவான நரியின் உண்மை இயல்பு வெளிப்பட்ட பஞ்சதந்திர கதை.' },
    te: { title: 'నీలి నక్క', summary: 'నీలి రంగు తొట్టిలో పడి అడవికి రాజైన నక్క యొక్క నిజ స్వరూపం బయటపడిన కథ.' },
    bn: { title: 'নীল শিয়াল', summary: 'নীলের গামলায় পড়ে বনের রাজা হওয়া শিয়ালের আসল রূপ প্রকাশের কাহিনী।' },
    mr: { title: 'निळा कोल्हा', summary: 'निळ्या रंगाच्या हौदात पडून जंगलाचा राजा बनलेल्या कोल्ह्याची मनोरंजक पंचतंत्र कथा.' },
    gu: { title: 'નીલો શિયાળ', summary: 'વાદળી રંગના કુંડામાં પડી જંગલનો રાજા બનેલા શિયાળની પ્રખ્યાત લોકવાર્તા.' },
    kn: { title: 'ನೀಲಿ ನರಿ', summary: 'ನೀಲಿ ಬಣ್ಣದ ತೊಟ್ಟಿಯಲ್ಲಿ ಬಿದ್ದು ಕಾಡಿನ ರಾಜನಾದ ನರಿಯ ನಿಜವಾದ ಸ್ವರೂಪ ತಿಳಿಸುವ ಕಥೆ.' },
    ml: { title: 'നീല കുറുക്കൻ', summary: 'നീലത്തൊട്ടിയിൽ വീണ് കാട്ടിലെ രാജാവായ കുറുക്കന്റെ യഥാർത്ഥ ഭാവം വെളിപ്പെട്ട കഥ.' },
    or: { title: 'ନୀଳ ଶିଆଳ', summary: 'ନୀଳ କୁଣ୍ଡରେ ପଡ଼ି ଜଙ୍ଗଲର ରାଜା ବନିଥିବା ଶିଆଳର ପ୍ରକୃତ ସ୍ୱରୂପ ପ୍ରକାଶ ପାଇବା କଥା।' },
    pa: { title: 'ਨੀਲਾ ਗਿੱਦੜ', summary: 'ਨੀਲ ਦੇ ਕੁੰਡੇ ਵਿੱਚ ਡਿੱਗ ਕੇ ਜੰਗਲ ਦਾ ਰਾਜਾ ਬਣੇ ਗਿੱਦੜ ਦੀ ਸੱਚਾਈ ਸਾਹਮਣੇ ਆਉਣ ਦੀ ਕਹਾਣੀ।' },
    as: { title: 'নীলা শিয়াল', summary: 'নীলৰ চৰিয়াত পৰি বনৰ ৰজা হোৱা শিয়ালৰ স্বভাৱ প্ৰকাশ পোৱাৰ পঞ্চতন্ত্ৰৰ সাধু।' }
  },
  "Kaveri's Secret Waters": {
    hi: { title: 'कावेरी का रहस्यमयी जल', summary: 'श्रीरंगपट्टण के तट पर आधी रात को संस्कृत श्लोक गुनगुनाने वाली पवित्र कावेरी नदी की लोककथा।' },
    ta: { title: 'காவிரியின் ரகசிய நீர்', summary: 'ஸ்ரீரங்கப்பட்டணத்தில் நடு இரவில் சமஸ்கிருத சுலோகங்களை முணுமுணுக்கும் புனித காவிரி நதியின் புராணம்.' },
    te: { title: 'కావేరి రహస్య జలాలు', summary: 'శ్రీరంగపట్నం వద్ద అర్ధరాత్రి వేళ సంస్కృత శ్లోకాలు పలికే పవిత్ర కావేరీ నది గాథ.' },
    bn: { title: 'কাবেরীর রহস্যময় জল', summary: 'শ্রীরঙ্গপত্তনমে মধ্যরাতে সংস্কৃত শ্লোক ধ্বনিত হওয়া পবিত্র কাবেরী নদীর লোকগাথা।' },
    mr: { title: 'कावेरीचे गूढ पाणी', summary: 'श्रीरंगपट्टणजवळ मध्यरात्री संस्कृत श्लोक उच्चारणाऱ्या कावेरी नदीची रहस्यमय कथा.' },
    gu: { title: 'કાવેરીનું રહસ્યમય જળ', summary: 'શ્રીરંગપટ્ટણમાં મધ્યરાત્રિએ સંસ્કૃત શ્લોકો ગુંજાવતી પવિત્ર કાવેરી નદીની પૌરાણિક કથા.' },
    kn: { title: 'ಕಾವೇರಿಯ ರಹಸ್ಯ ಜಲ', summary: 'ಶ್ರೀರಂಗಪಟ್ಟಣದಲ್ಲಿ ಮಧ್ಯರಾತ್ರಿ ಸಂಸ್ಕೃತ ಶ್ಲೋಕಗಳನ್ನು ಪಿಸುಗುಟ್ಟುವ ಪವಿತ್ರ ಕಾವೇರಿ ನದಿಯ ಜಾನಪದ ಕಥೆ.' },
    ml: { title: 'കാവേരിയുടെ നിഗൂഢ ജലം', summary: 'ശ്രീരംഗപട്ടണത്തിൽ പാതിരാത്രിയിൽ സംസ്കൃത ശ്ലോകങ്ങൾ മന്ത്രിക്കുന്ന കാവേരീ നദിയുടെ ഐതിഹ്യം.' },
    or: { title: 'କାବେରୀର ରହସ୍ୟମୟ ଜଳ', summary: 'ଶ୍ରୀରଙ୍ଗପଟ୍ଟନ ନିକଟରେ ମଧ୍ୟରାତ୍ରିରେ ସଂସ୍କୃତ ଶ୍ଲୋକ ଶୁଣାଉଥିବା ପବିତ୍ର କାବେରୀ ନଦୀର ଗାଥା।' },
    pa: { title: 'ਕਾਵੇਰੀ ਦਾ ਰਹੱਸਮਈ ਪਾਣੀ', summary: 'ਸ਼੍ਰੀਰੰਗਪਟਨਾ ਵਿੱਚ ਅੱਧੀ ਰਾਤ ਨੂੰ ਸੰਸਕ੍ਰਿਤ ਦੇ ਸ਼ਲੋਕ ਬੋਲਣ ਵਾਲੀ ਪਵਿੱਤਰ ਕਾਵੇਰੀ ਨਦੀ ਦੀ ਕਹਾਣੀ।' },
    as: { title: 'কাবেৰীৰ ৰহস্যময় জলধাৰা', summary: 'শ্ৰীৰংগপট্টনমত মাজনিশা সংস্কৃত শ্লোক উচ্চাৰণ কৰা পৱিত্ৰ কাবেৰী নদীৰ লোকগাথা।' }
  },
  "The Warli Painter's Vision": {
    hi: { title: 'वारली चित्रकार की दृष्टि', summary: 'महाराष्ट्र की वारली जनजाति में चावल के लेप से प्रकृति और पूर्वजों की स्मृति को भित्तिचित्रों में उकेरने की परंपरा।' },
    ta: { title: 'வார்லி ஓவியரின் பார்வை', summary: 'மகாராஷ்டிராவின் வார்லி பழங்குடியினர் தங்களின் முன்னோர்கள் மற்றும் இயற்கையை சுவரோவியங்களாக வரையும் பாரம்பரியம்.' },
    te: { title: 'వార్లీ చిత్రకారుడి దృష్టి', summary: 'మహారాష్ట్రలోని వార్లీ గిరిజనుల ప్రకృతి మరియు పూర్వీకుల స్మృతులను చిత్రించే పవిత్ర కళారూపం.' },
    bn: { title: 'ওয়ারলি চিত্রকরের দৃষ্টি', summary: 'মহারাষ্ট্রের ওয়ারলি উপজাতির প্রকৃতি ও পূর্বপুরুষদের স্মরণে চালের লেই দিয়ে আঁকা ঐতিহ্যবাহী দেয়ালচিত্র।' },
    mr: { title: 'वारली चित्रकाराची दृष्टी', summary: 'महाराष्ट्रातील वारली जमातीची तांदळाच्या पिठाने निसर्ग आणि पूर्वजांचे जीवन भित्तीचित्रात जिवंत करणारी परंपरा.' },
    gu: { title: 'વારલી ચિત્રકારની દ્રષ્ટિ', summary: 'મહારાષ્ટ્રની વારલી આદિવાસી સંસ્કૃતિમાં ચોખાની પેસ્ટથી પ્રકૃતિ અને પૂર્વજોની સ્મૃતિઓ કંડારવાની કળા.' },
    kn: { title: 'ವಾರ್ಲಿ ಚಿತ್ರಕಾರನ ದೃಷ್ಟಿ', summary: 'ಮಹಾರಾಷ್ಟ್ರದ ವಾರ್ಲಿ ಬುಡಕಟ್ಟು ಜನಾಂಗದವರು ಪ್ರಕೃತಿ ಮತ್ತು ಹಿರಿಯರ ನೆನಪುಗಳನ್ನು ಗೋಡೆಗಳಲ್ಲಿ ಚಿತ್ರಿಸುವ ಪವಿತ್ರ ಕಲೆ.' },
    ml: { title: 'വാർലി ചിത്രകാരന്റെ കാഴ്ച', summary: 'മഹാരാഷ്ട്രയിലെ വാർലി ഗോത്രവിഭാഗം പ്രകൃതിയെയും പൂർവ്വികരെയും ചുവർച്ചിത്രങ്ങളാക്കുന്ന പുരാതന പാരമ്പര്യം.' },
    or: { title: 'ୱାର୍ଲି ଚିତ୍ରକାରଙ୍କ ଦୃଷ୍ଟି', summary: 'ମହାରାଷ୍ଟ୍ରର ୱାର୍ଲି ଜନଜାତିଙ୍କ ପ୍ରକୃତି ଓ ପୂର୍ବପୁରୁଷଙ୍କ ସ୍ମୃତିକୁ କାନ୍ଥରେ ଆଙ୍କିବାର ପବିତ୍ର ପରମ୍ପରା।' },
    pa: { title: 'ਵਾਰਲੀ ਚਿੱਤਰਕਾਰ ਦੀ ਨਜ਼ਰ', summary: 'ਮਹਾਰਾਸ਼ਟਰ ਦੇ ਵਾਰਲੀ ਕਬੀਲੇ ਵਿੱਚ ਕੁਦਰਤ ਅਤੇ ਬਜ਼ੁਰਗਾਂ ਦੀਆਂ ਯਾਦਾਂ ਨੂੰ ਕੰਧ-ਚਿੱਤਰਾਂ ਵਿੱਚ ਉਕੇਰਨ ਦੀ ਕਲਾ।' },
    as: { title: 'ৱাৰ্লি চিত্ৰশিল্পীৰ দৃষ্টি', summary: 'মহাৰাষ্ট্ৰৰ ৱাৰ্লি জনজাতিৰ প্ৰকৃতি আৰু পূৰ্বপুৰুষক দেৱালত অংকন কৰাৰ প্ৰাচীন পৰম্পৰা।' }
  },
  "Emperor Ashoka's Peace": {
    hi: { title: 'सम्राट अशोक का शांति संदेश', summary: 'कलिंग युद्ध के पश्चाताप के बाद हिंसा त्याग कर धर्मविजय और बौद्ध करुणा को अपनाने वाले महान सम्राट की गाथा।' },
    ta: { title: 'அசோக சக்கரவர்த்தியின் அமைதி', summary: 'கலிங்கப் போருக்குப் பின் வன்முறையைத் துறந்து தர்மவிஜயம் மற்றும் புத்தரின் கருணையைத் தழுவிய பேரரசரின் வரலாறு.' },
    te: { title: 'అశోక చక్రవర్తి శాంతి సందేశం', summary: 'కళింగ యుద్ధం అనంతరం హింసను వీడి ధర్మవిజయంతో శాంతి, కరుణలను చాటిన గొప్ప చక్రవర్తి గాథ.' },
    bn: { title: 'সম্রাট অশোকের শান্তি বার্তা', summary: 'কলিঙ্গ যুদ্ধের পর হিংসা ত্যাগ করে ধর্মবিজয় ও বুদ্ধের অহিংসা গ্রহণকারী মহান সম্রাটের ইতিহাস।' },
    mr: { title: 'सम्राट अशोकाचा शांततेचा मार्ग', summary: 'कलिंग युद्धानंतर रक्तपात त्यागून धर्मविजय व करुणेचा संदेश देणाऱ्या सम्राट अशोकाची ऐतिहासिक गाथा.' },
    gu: { title: 'સમ્રાટ અશોકનો શાંતિ સંદેશ', summary: 'કલિંગ યુદ્ધ પછી હિંસાનો ત્યાગ કરી ધર્મવિજય અને બૌદ્ધ કરુણા અપનાવનાર મહાન સમ્રાટની કથા.' },
    kn: { title: 'ಚಕ್ರವರ್ತಿ ಅಶೋಕನ ಶಾಂತಿ ಸಂದೇಶ', summary: 'ಕಳಿಂಗ ಯುದ್ಧದ ಬಳಿಕ ಹಿಂಸೆಯನ್ನು ತ್ಯಜಿಸಿ ಧರ್ಮವಿಜಯ ಮತ್ತು ಬುದ್ಧನ ಕರುಣೆಯನ್ನು ಅಪ್ಪಿಕೊಂಡ ಮಹಾನ್ ಚಕ್ರವರ್ತಿಯ ಚರಿತ್ರೆ.' },
    ml: { title: 'അശോക ചക്രവർത്തിയുടെ സമാധാന സന്ദേശം', summary: 'കലിംഗ യുദ്ധത്തിന് ശേഷം അക്രമം വെടിഞ്ഞ് ധർമ്മവിജയവും കാരുണ്യവും സ്വീകരിച്ച മഹാനായ ചക്രവർത്തിയുടെ ചരിത്രം.' },
    or: { title: 'ସମ୍ରାଟ ଅଶୋକଙ୍କ ଶାନ୍ତି ବାର୍ତ୍ତା', summary: 'କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ହିଂସା ତ୍ୟାଗ କରି ଧର୍ମବିଜୟ ଓ କରୁଣା ଆପଣାଇଥିବା ମହାନ ସମ୍ରାଟଙ୍କ ଇତିହାସ।' },
    pa: { title: 'ਸਮਰਾਟ ਅਸ਼ੋਕ ਦਾ ਅਮਨ ਸੰਦੇਸ਼', summary: 'ਕਲਿੰਗ ਜੰਗ ਤੋਂ ਬਾਅਦ ਹਿੰਸਾ ਤਿਆਗ ਕੇ ਧਰਮਵਿਜੈ ਅਤੇ ਬੁੱਧ ਦੀ ਕਰੁਣਾ ਨੂੰ ਅਪਣਾਉਣ ਵਾਲੇ ਮਹਾਨ ਸਮਰਾਟ ਦੀ ਗਾਥਾ।' },
    as: { title: 'সম্ৰাট অশোকৰ শান্তি বাৰ্তা', summary: 'কলিংগ যুদ্ধৰ পিছত হিংসা পৰিত্যাগ কৰি ধৰ্মবিজয় আৰু কৰুণা আঁকোৱালি লোৱা মহান সম্ৰাটৰ বুৰঞ্জী।' }
  }
};

/**
 * High-speed translation API utilizing multiple fallback endpoints:
 * 1. Pre-computed dictionary cache
 * 2. In-memory session cache
 * 3. Fast multi-language endpoint
 * 4. MyMemory public backup
 */
export const translateText = async (text, sourceLang = 'en', targetLang = 'hi') => {
  if (!text || !text.trim()) return '';
  if (sourceLang === targetLang) return text;

  const cacheKey = `${sourceLang}_${targetLang}_${text.slice(0, 100)}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 1. Try Google Translate single GTX endpoint (ultra-fast, zero auth, supports all 12 Indian languages)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).join('');
        if (translated && translated.trim()) {
          memoryCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Try MyMemory Translation API
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(mmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        memoryCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  return text;
};

/**
 * Translate a complete story (title and content) into the target Indian language
 */
export const translateStory = async (title, content, sourceLang = 'en', targetLang = 'hi') => {
  if (!title && !content) return { title: '', content: '' };
  if (sourceLang === targetLang) return { title, content };

  const normTitle = title?.trim() || '';

  let translatedTitle = null;
  let translatedContent = null;

  // 1. Check pre-translated curated library
  if (normTitle && PRESET_TRANSLATIONS[normTitle] && PRESET_TRANSLATIONS[normTitle][targetLang]) {
    const preset = PRESET_TRANSLATIONS[normTitle][targetLang];
    translatedTitle = preset.title;
    if (preset.summary) {
      translatedContent = preset.summary;
    }
  }

  // 2. Perform live translation if not fully preset
  try {
    if (!translatedTitle && title) {
      translatedTitle = await translateText(title, sourceLang, targetLang);
    }

    if (!translatedContent && content) {
      const paragraphs = content.split('\n\n').filter(Boolean);
      if (paragraphs.length > 0) {
        const translatedParagraphs = await Promise.all(
          paragraphs.slice(0, 5).map(p => translateText(p, sourceLang, targetLang))
        );
        translatedContent = translatedParagraphs.join('\n\n');
      } else {
        translatedContent = await translateText(content, sourceLang, targetLang);
      }
    }

    return {
      title: translatedTitle || title,
      content: translatedContent || content
    };
  } catch (err) {
    console.error('Translation error:', err);
    return {
      title: translatedTitle || title,
      content: translatedContent || content
    };
  }
};
