/**
 * Pakistan Location Hierarchy Dataset
 * Province → Cities → Areas (zones / postal areas)
 * Used for cascading dropdown in client registration and order placement
 */

const PAKISTAN_LOCATIONS = {
  Punjab: {
    Lahore: [
      'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5',
      'DHA Phase 6', 'Gulberg I', 'Gulberg II', 'Gulberg III', 'Model Town',
      'Johar Town', 'Garden Town', 'Faisal Town', 'Iqbal Town', 'Township',
      'Allama Iqbal Town', 'Wapda Town', 'Bahria Town', 'Lake City',
      'Cantt', 'Shadman', 'Mall Road Area', 'Anarkali', 'Garhi Shahu',
      'Samnabad', 'Green Town', 'Samanabad', 'Ravi Road', 'Badami Bagh',
      'Data Darbar Area', 'Baghbanpura', 'Shahdara', 'Harbanspura',
      'Kot Lakhpat (Industrial)', 'Sundar Industrial Estate', 'Quaid-e-Azam Industrial Estate',
    ],
    Faisalabad: [
      'D-Ground', 'Peoples Colony', 'Ghulam Muhammad Abad', 'Madina Town',
      'Satiana Road', 'Sargodha Road', 'Jaranwala Road', 'Lyallpur Town',
      'Susan Road', 'Kohinoor City', 'Eden Garden', 'Canal Road Area',
      'Millat Road', 'Dijkot Road', 'Railway Road', 'Clock Tower Area',
      'Gulshan-e-Madina', 'Batala Colony', 'Industrial Estate Faisalabad',
    ],
    Rawalpindi: [
      'Satellite Town', 'Bahria Town Rawalpindi', 'DHA Rawalpindi', 'Gulraiz',
      'Chaklala Scheme', 'Westridge', 'Cantt Area', 'Saddar', 'Murree Road',
      'Committee Chowk Area', '6th Road', 'Adiala Road', 'Islamabad Highway',
      'Airport Road', 'Koral Chowk', 'New Lalazar', 'Old Lalazar', 'Tench Bhatta',
    ],
    Multan: [
      'Cantt', 'Shah Rukn-e-Alam Colony', 'Gulgasht Colony', 'New Multan',
      'Bosan Road', 'Vehari Road', 'Khanewal Road', 'Lohari Gate',
      'Hussain Agahi', 'Model Town', 'DHA Multan', 'Bahria Town Multan',
      'Mumtazabad', 'Ghausia Colony', 'Qasim Bela Industrial Area',
    ],
    Gujranwala: [
      'Sialkot Road Area', 'GT Road Area', 'Model Town', 'People Colony',
      'Shadab Colony', 'Wapda Town', 'Gondlanwala Road', 'Jail Road Area',
      'Trust Colony', 'Islam Pura', 'Industrial Area Gujranwala',
    ],
    Sialkot: [
      'Cantt', 'Paris Road', 'Lahore Road', 'Eminabad Road', 'Wazirabad Road',
      'Export Processing Zone', 'Daska Road', 'Sialkot Industrial Estate',
      'Sambrial', 'Pasrur Road', 'Airport Road Sialkot',
    ],
    Sargodha: [
      'University Road', 'Satellite Town', 'Shahab Pura', 'Civil Lines',
      'Jhawarian Road', 'Faisalabad Road', 'Bhera Road', 'Cantt Area',
      'Model Town Sargodha', 'Sillanwali Road',
    ],
    Bahawalpur: [
      'Model Town A', 'Model Town B', 'Satellite Town', 'Cantt',
      'Baghdad-ul-Jadeed', 'Farid Gate Area', 'Circular Road', 'Multan Road',
      'Ahmadpur East Road', 'Yazman Road', 'Bahawal Victoria Hospital Area',
    ],
    Gujrat: [
      'G.T. Road Area', 'Jalalpur Road', 'Kharian Road', 'Lalamusa Road',
      'Model Town', 'Satellite Town', 'Industrial Area Gujrat',
    ],
    Sheikhupura: [
      'Faisalabad Road', 'Lahore Road', 'Nankana Sahib Road',
      'Industrial Estate Sheikhupura', 'Muridke', 'Ferozewala',
    ],
    Jhang: [
      'Chiniot Road', 'Shorkot Road', 'Faisalabad Road', 'Ahmad Nagar',
      'Satellite Town Jhang', 'G.T. Road',
    ],
    'Rahim Yar Khan': [
      'Saddar', 'Cantt', 'Model Town', 'Liaquat Road', 'Airport Road',
      'Khanpur Road', 'Industrial Area RYK',
    ],
    Chakwal: ['G.T. Road', 'Talagang Road', 'Rawalpindi Road', 'Choa Saidan Shah Road'],
    Jhelum: ['Cantt', 'Civil Lines', 'G.T. Road', 'Pind Dadan Khan Road', 'Dina Road'],
    Kasur: ['Lahore Road', 'Chunian Road', 'Pattoki Road', 'Kot Radha Kishan'],
    Okara: ['Depalpur Road', 'Sahiwal Road', 'Model Town Okara', 'Haveli Lakha'],
    Sahiwal: ['Model Town', 'Multan Road', 'Faisalabad Road', 'Pakpattan Road'],
    Narowal: ['Sialkot Road', 'Lahore Road', 'Shakargarh', 'Zafarwal'],
    'Mandi Bahauddin': ['G.T. Road', 'Gujrat Road', 'Sargodha Road', 'Phalia'],
  },

  Sindh: {
    Karachi: [
      'DHA Phase 1-8', 'Clifton', 'Bath Island', 'Kemari', 'Saddar',
      'North Nazimabad', 'Gulshan-e-Iqbal', 'Gulistan-e-Johar', 'Malir',
      'Korangi', 'SITE Area', 'Landhi Industrial Area', 'North Karachi Industrial',
      'F.B. Area', 'New Karachi', 'Liaquatabad', 'Nazimabad', 'Orangi Town',
      'Baldia Town', 'Lyari', 'Keamari', 'Manghopir', 'Surjani Town',
      'Scheme 33', 'Scheme 36', 'Bufferzone', 'Sector 5-C', 'Port Qasim',
      'Bin Qasim Industrial Zone', 'Superhighway', 'Gadap Town',
    ],
    Hyderabad: [
      'Latifabad', 'Qasimabad', 'Hirabad', 'Cantt', 'Civil Lines',
      'Kotri Industrial Area', 'Auto Bhan Road', 'Hussainabad', 'Tilak Incline',
      'Pahore', 'Unit 1-11', 'Tando Allahyar Road',
    ],
    Sukkur: [
      'Rohri', 'New Sukkur', 'Minara Road', 'Barrage Colony',
      'University Road', 'Military Road', 'Khairpur Road',
    ],
    Larkana: [
      'Doctor Colony', 'City Area', 'Naudero Road', 'Shahdadkot Road',
      'Jacobabad Road', 'Shikarpur Road',
    ],
    Mirpurkhas: ['New Town', 'Old City', 'Badin Road', 'Umarkot Road'],
    Nawabshah: ['Sakrand Road', 'Sanghar Road', 'City Area', 'Bypass Road'],
    Khairpur: ['Gambat Road', 'Sukkur Road', 'City Centre', 'Kot Diji'],
    Jacobabad: ['Shikarpur Road', 'Quetta Road', 'City Area'],
    Shikarpur: ['Sukkur Road', 'Larkana Road', 'City Area'],
    Dadu: ['Mehar', 'Khairpur Nathan Shah', 'Johi Road', 'Sehwan Road'],
    Thatta: ['Makli', 'Sujawal', 'Gharo', 'Port Qasim Road'],
    Badin: ['Tando Bago', 'Matli', 'Talhar', 'City Area'],
    Sanghar: ['Shahdadpur', 'Sinjhoro', 'Tando Adam', 'City Area'],
  },

  'Khyber Pakhtunkhwa': {
    Peshawar: [
      'Hayatabad Phase 1-7', 'University Town', 'Cantt', 'Saddar',
      'Dalazak Road', 'Ring Road', 'Warsak Road', 'Kohat Road',
      'Charsadda Road', 'GT Road Peshawar', 'Jamrud Road', 'Bara Road',
      'Gulbahar', 'Firdous Colony', 'Pishtakhara', 'Regi Model Town',
      'Chamkani', 'Board Bazar Area', 'Karkhano Market Area',
    ],
    Mardan: [
      'Cantt', 'Circular Road', 'Nowshera Road', 'Swabi Road',
      'Takht Bhai', 'Rustam Road', 'GT Road Mardan', 'Industrial Estate Mardan',
    ],
    Abbottabad: [
      'Cantt', 'Mandian', 'Nawan Shehr', 'Havelian Road',
      'Haripur Road', 'Kaghan Road', 'Kehal', 'Mirpur Road',
    ],
    Mingora: [
      'Saidu Sharif', 'Fizagat', 'City Area', 'Matta Road',
      'Landakai', 'Bahrain Road',
    ],
    Kohat: ['Cantt', 'City Area', 'Hangu Road', 'Bannu Road', 'Peshawar Road'],
    Nowshera: [
      'Cantt', 'Industrial Area Nowshera', 'Pabbi', 'Jehangira',
      'Akora Khattak', 'GT Road',
    ],
    Mansehra: ['Battal', 'Oghi', 'Balakot Road', 'Shinkiari', 'City Area'],
    'Dera Ismail Khan': [
      'Cantt', 'City Area', 'Kohat Road', 'Tank Road', 'Indus Highway',
    ],
    Bannu: ['City Area', 'Lakki Marwat Road', 'DI Khan Road', 'Cantt'],
    Swabi: ['Topi', 'Jehangira Road', 'Mardan Road', 'Industrial Estate Swabi'],
    Charsadda: ['Shabqadar', 'Tangi', 'GT Road', 'Peshawar Road'],
    Haripur: ['Ghazi', 'Taxila Road', 'Abbottabad Road', 'Hattar Industrial Estate'],
  },

  Balochistan: {
    Quetta: [
      'Cantt', 'Satellite Town', 'Jinnah Town', 'Saryab Road',
      'Airport Road', 'Western Bypass', 'Brewery Road', 'Spini Road',
      'Zarghoon Road', 'Meezan Road', 'Shalkot', 'Kirani Road',
    ],
    Gwadar: [
      'City Centre', 'Gwadar Port Area', 'Free Zone', 'Pasni Road',
      'New Town', 'PNS Akram Road', 'Fisheries Colony',
    ],
    Turbat: ['City Area', 'Pasni Road', 'Panjgur Road', 'Buleda Road'],
    Khuzdar: ['City Area', 'Surab Road', 'Kalat Road', 'Wadh Road'],
    Chaman: ['City Area', 'Quetta Road', 'Spin Boldak Border Area'],
    Zhob: ['City Area', 'D.I. Khan Road', 'Sherani Road'],
    Sibi: ['City Area', 'Quetta Road', 'Jacobabad Road', 'Harnai Road'],
    Loralai: ['City Area', 'Quetta Road', 'Barkhan Road'],
    Panjgur: ['City Area', 'Turbat Road', 'Khash Road'],
    Dera_Murad_Jamali: ['City Area', 'Sukkur Road', 'Khuzdar Road'],
  },

  'Islamabad Capital Territory': {
    Islamabad: [
      'F-6 / Super Market', 'F-7 / Jinnah Super', 'F-8 Markaz', 'F-10 Markaz',
      'F-11', 'G-6', 'G-7 Abpara', 'G-8 Markaz', 'G-9 Karachi Company',
      'G-10', 'G-11', 'G-13', 'G-14', 'H-8', 'H-9', 'H-10', 'H-13',
      'I-8 Markaz', 'I-9 Industrial Area', 'I-10 Industrial Area',
      'Blue Area', 'Diplomatic Enclave', 'Bahria Town Islamabad',
      'DHA Islamabad Phase 1-6', 'E-7', 'E-9', 'E-11',
      'Bani Gala', 'Margalla Road', 'Golra Road', 'Rawat',
      'Tarlai', 'Soan Garden', 'Airport Road Islamabad',
      'NUST Area', 'CDA Sector',
    ],
  },

  'Azad Jammu & Kashmir': {
    Muzaffarabad: [
      'City Area', 'Satiyan Road', 'Chattar Kalas', 'Garhi Dupatta', 'Rawalakot Road',
    ],
    Mirpur: ['City Area', 'New Mirpur', 'Allama Iqbal Town', 'Chakswari Road'],
    Rawalakot: ['City Area', 'Banjosa Road', 'Hajira Road', 'Muzaffarabad Road'],
    Kotli: ['City Area', 'Mirpur Road', 'Rawalakot Road'],
    Bhimber: ['City Area', 'Gujrat Road', 'Sialkot Road'],
  },

  'Gilgit-Baltistan': {
    Gilgit: ['City Area', 'Airport Road', 'Jutial', 'Aga Khan Road', 'Barikot Road'],
    Skardu: ['City Area', 'Airport Road', 'Satpara Road', 'Shigar Road'],
    Ghanche: ['Khaplu', 'City Area'],
    Ghizer: ['Gahkuch', 'Gupis', 'City Area'],
    Hunza: ['Karimabad', 'Aliabad', 'Ganesh', 'Passu'],
  },
};

/**
 * Returns sorted list of provinces
 */
const getProvinces = () => Object.keys(PAKISTAN_LOCATIONS).sort();

/**
 * Returns cities for a given province
 */
const getCitiesByProvince = (province) => {
  if (!PAKISTAN_LOCATIONS[province]) return [];
  return Object.keys(PAKISTAN_LOCATIONS[province]).sort();
};

/**
 * Returns areas for a given province and city
 */
const getAreasByCity = (province, city) => {
  if (!PAKISTAN_LOCATIONS[province] || !PAKISTAN_LOCATIONS[province][city]) return [];
  return PAKISTAN_LOCATIONS[province][city].sort();
};

module.exports = {
  PAKISTAN_LOCATIONS,
  getProvinces,
  getCitiesByProvince,
  getAreasByCity,
};
