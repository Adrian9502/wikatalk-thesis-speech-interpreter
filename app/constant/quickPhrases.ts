interface Phrase {
  label: string;
  text: string;
}

interface PhraseCategory {
  category: string;
  phrases: Phrase[];
}

const QUICK_PHRASES: Record<string, PhraseCategory[]> = {
  // TAGALOG
  Tagalog: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kamusta" },
        { label: "Good morning", text: "Magandang umaga" },
        { label: "Good afternoon", text: "Magandang hapon" },
        { label: "Good evening", text: "Magandang gabi" },
        { label: "Welcome", text: "Maligayang pagdating" },
        { label: "How are you?", text: "Kamusta ka?" },
        { label: "Nice to meet you", text: "Ikinagagalak kong makilala ka" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat po" },
        { label: "You're welcome", text: "Walang anuman" },
        { label: "Sorry", text: "Pasensya na po" },
        { label: "Excuse me", text: "Makikiraan po" },
        { label: "Goodbye", text: "Paalam" },
        { label: "Take care", text: "Ingat ka" },
        { label: "I don't understand", text: "Hindi ko naiintindihan" },
        { label: "Yes", text: "Oo" },
        { label: "No", text: "Hindi" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Ano ang pangalan mo?" },
        { label: "Where are you from?", text: "Taga saan ka?" },
        { label: "How much is this?", text: "Magkano ito?" },
        { label: "Where is...?", text: "Nasaan ang...?" },
        { label: "Can you help me?", text: "Pwede mo ba akong tulungan?" },
        { label: "What time is it?", text: "Anong oras na?" },
        {
          label: "Do you speak English?",
          text: "Nagsasalita ka ba ng Ingles?",
        },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Mano po" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pakikisama" },
        { label: "Utang na loob", text: "Utang na loob" },
        { label: "Bayanihan", text: "Bayanihan" },
        { label: "Mabuhay", text: "Mabuhay!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tulong!" },
        { label: "Call a doctor", text: "Tumawag ng doktor" },
        { label: "Call the police", text: "Tumawag ng pulis" },
        { label: "I am lost", text: "Naliligaw ako" },
        { label: "I need help", text: "Kailangan ko ng tulong" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Nagugutom ako" },
        { label: "I'm thirsty", text: "Nauuhaw ako" },
        { label: "Delicious!", text: "Masarap!" },
        { label: "I want water", text: "Gusto ko ng tubig" },
        { label: "Check, please", text: "Pakiabot ng bill" },
      ],
    },
  ],
  // CEBUANO
  Cebuano: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Maayong buntag" },
        { label: "Good afternoon", text: "Maayong hapon" },
        { label: "Good evening", text: "Maayong gabii" },
        { label: "Welcome", text: "Maayong pag-abot" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Maayong makaila nimo" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat" },
        { label: "You're welcome", text: "Walay sapayan" },
        { label: "Sorry", text: "Pasayloa ko" },
        { label: "Excuse me", text: "Paagi ko" },
        { label: "Goodbye", text: "Amping" },
        { label: "Take care", text: "Pag-amping" },
        { label: "I don't understand", text: "Wala ko kasabot" },
        { label: "Yes", text: "Oo" },
        { label: "No", text: "Dili" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Unsa imong pangalan?" },
        { label: "Where are you from?", text: "Taga-asa ka?" },
        { label: "How much is this?", text: "Tagpila kini?" },
        { label: "Where is...?", text: "Asa ang...?" },
        { label: "Can you help me?", text: "Makatabang ka nako?" },
        { label: "What time is it?", text: "Unsa na orasa?" },
        {
          label: "Do you speak English?",
          text: "Makasulti ka ba og Iningles?",
        },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Pagmano" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pag-uyon" },
        { label: "Utang na loob", text: "Utang kabubut-on" },
        { label: "Bayanihan", text: "Tinabangay" },
        { label: "Mabuhay", text: "Mabuhi!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tabang!" },
        { label: "Call a doctor", text: "Tawaga ang doktor" },
        { label: "Call the police", text: "Tawaga ang pulis" },
        { label: "I am lost", text: "Nawala ko" },
        { label: "I need help", text: "Nanginahanglan ko og tabang" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gigutom ko" },
        { label: "I'm thirsty", text: "Giuhaw ko" },
        { label: "Delicious!", text: "Lami!" },
        { label: "I want water", text: "Gusto ko og tubig" },
        { label: "Check, please", text: "Palihug og bill" },
      ],
    },
  ],
  // HILIGAYNON
  Hiligaynon: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Maayong aga" },
        { label: "Good afternoon", text: "Maayong hapon" },
        { label: "Good evening", text: "Maayong gab-i" },
        { label: "Welcome", text: "Dayon" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Nalipay ako nga makilala ka" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat" },
        { label: "You're welcome", text: "Wala sang ano man" },
        { label: "Sorry", text: "Pasensiya na" },
        { label: "Excuse me", text: "Palihug" },
        { label: "Goodbye", text: "Palangga ka" },
        { label: "Take care", text: "Maghalong ka" },
        { label: "I don't understand", text: "Indi ko kaintindi" },
        { label: "Yes", text: "Oo" },
        { label: "No", text: "Indi" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Ano pangalan mo?" },
        { label: "Where are you from?", text: "Taga-diin ka?" },
        { label: "How much is this?", text: "Tagpila ini?" },
        { label: "Where is...?", text: "Diin ang...?" },
        { label: "Can you help me?", text: "Makahatag ka bulig sa akon?" },
        { label: "What time is it?", text: "Anong oras na?" },
        { label: "Do you speak English?", text: "Kabalo ka mag-Ingles?" },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Pagmano" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pag-uyon" },
        { label: "Utang na loob", text: "Utang kabubut-on" },
        { label: "Bayanihan", text: "Tinabangay" },
        { label: "Mabuhay", text: "Mabuhi!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Bulig!" },
        { label: "Call a doctor", text: "Tawga ang doktor" },
        { label: "Call the police", text: "Tawga ang pulis" },
        { label: "I am lost", text: "Nadula ako" },
        { label: "I need help", text: "Kinahanglan ko sang bulig" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gutom ako" },
        { label: "I'm thirsty", text: "Uhaw ako" },
        { label: "Delicious!", text: "Namit!" },
        { label: "I want water", text: "Gusto ko sang tubig" },
        { label: "Check, please", text: "Palihug bayad" },
      ],
    },
  ],
  // ILOCANO
  Ilocano: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Naimbag a bigat" },
        { label: "Good afternoon", text: "Naimbag a malem" },
        { label: "Good evening", text: "Naimbag a rabii" },
        { label: "Welcome", text: "Naragsak nga isasangbay" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Naragsakak nga makilala ka" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Agyamanak" },
        { label: "You're welcome", text: "Awan ti aniaman" },
        { label: "Sorry", text: "Pakawan" },
        { label: "Excuse me", text: "Pakawan" },
        { label: "Goodbye", text: "Agyamanak kenka" },
        { label: "Take care", text: "Agyanad ka" },
        { label: "I don't understand", text: "Dikitak maawatan" },
        { label: "Yes", text: "Wen" },
        { label: "No", text: "Haaan" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Ania ti nagan mo?" },
        { label: "Where are you from?", text: "Tagaanoka?" },
        { label: "How much is this?", text: "Mano daytoy?" },
        { label: "Where is...?", text: "Sadino ti...?" },
        { label: "Can you help me?", text: "Makatulongka kaniak?" },
        { label: "What time is it?", text: "Ania ti oras?" },
        { label: "Do you speak English?", text: "Makasao ka iti Ingles?" },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Agyamanak" },
        { label: "Bahala na", text: "Maited ken Apo" },
        { label: "Pakikisama", text: "Panagtitinnulong" },
        { label: "Utang na loob", text: "Naimbag a rikna" },
        { label: "Bayanihan", text: "Tinnulong" },
        { label: "Mabuhay", text: "Agbiag!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tulong!" },
        { label: "Call a doctor", text: "Awagan ti doktor" },
        { label: "Call the police", text: "Awagan ti pulis" },
        { label: "I am lost", text: "Nailak" },
        { label: "I need help", text: "Masapul ko ti tulong" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Nagugutok" },
        { label: "I'm thirsty", text: "Nauhawak" },
        { label: "Delicious!", text: "Naimas!" },
        { label: "I want water", text: "Kayat ko ti danum" },
        { label: "Check, please", text: "Palawag ti bill" },
      ],
    },
  ],
  // BICOL
  Bicol: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Marhay na aga" },
        { label: "Good afternoon", text: "Marhay na hapon" },
        { label: "Good evening", text: "Marhay na banggi" },
        { label: "Welcome", text: "Marhay na pag-abot" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Marhay na makilala taka" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat" },
        { label: "You're welcome", text: "Dai ano man" },
        { label: "Sorry", text: "Patawad" },
        { label: "Excuse me", text: "Pakisadit" },
        { label: "Goodbye", text: "Dios mabalos" },
        { label: "Take care", text: "Mag-ingat ka" },
        { label: "I don't understand", text: "Dai ko naiintindihan" },
        { label: "Yes", text: "Opo" },
        { label: "No", text: "Dai" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Ano an pangaran mo?" },
        { label: "Where are you from?", text: "Taga-diin ka?" },
        { label: "How much is this?", text: "Pira ini?" },
        { label: "Where is...?", text: "Hain an...?" },
        { label: "Can you help me?", text: "Matabang ka sako?" },
        { label: "What time is it?", text: "Anong oras na?" },
        { label: "Do you speak English?", text: "Nakasabot ka nin Ingles?" },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Pagmano" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pakisaro" },
        { label: "Utang na loob", text: "Utang na buot" },
        { label: "Bayanihan", text: "Tabang" },
        { label: "Mabuhay", text: "Mabuhi!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tabang!" },
        { label: "Call a doctor", text: "Tawaga an doktor" },
        { label: "Call the police", text: "Tawaga an pulis" },
        { label: "I am lost", text: "Nawara ako" },
        { label: "I need help", text: "Kinakaipuhan ko nin tabang" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gutom na ako" },
        { label: "I'm thirsty", text: "Uhaw na ako" },
        { label: "Delicious!", text: "Masiram!" },
        { label: "I want water", text: "Gusto ko nin tubig" },
        { label: "Check, please", text: "Pakikuha an bill" },
      ],
    },
  ],
  // WARAY
  Waray: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Maupay nga aga" },
        { label: "Good afternoon", text: "Maupay nga kulop" },
        { label: "Good evening", text: "Maupay nga gab-i" },
        { label: "Welcome", text: "Maupay nga pag-abot" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Maupay nga makilala ka" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat" },
        { label: "You're welcome", text: "Waray sapayan" },
        { label: "Sorry", text: "Pasayloa ako" },
        { label: "Excuse me", text: "Aluy-ayi ako" },
        { label: "Goodbye", text: "Ayo-ayo" },
        { label: "Take care", text: "Pag-amping" },
        { label: "I don't understand", text: "Diri ako nakakasabot" },
        { label: "Yes", text: "Oo" },
        { label: "No", text: "Diri" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Ano an imo ngaran?" },
        { label: "Where are you from?", text: "Taga hain ka?" },
        { label: "How much is this?", text: "Tagpira ini?" },
        { label: "Where is...?", text: "Hain an...?" },
        { label: "Can you help me?", text: "Maka bulig ka ha akon?" },
        { label: "What time is it?", text: "Ano na oras?" },
        { label: "Do you speak English?", text: "Nakakayakan ka hin English?" },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Pagmano" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pakig-usa" },
        { label: "Utang na loob", text: "Utang nga kaburot-on" },
        { label: "Bayanihan", text: "Bayanihan" },
        { label: "Mabuhay", text: "Mabuhi!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Bulik!" },
        { label: "Call a doctor", text: "Tawaga an doktor" },
        { label: "Call the police", text: "Tawaga an pulis" },
        { label: "I am lost", text: "Nawara ako" },
        { label: "I need help", text: "Kinahanglan ko hin bulig" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gutom ako" },
        { label: "I'm thirsty", text: "Uhaw ako" },
        { label: "Delicious!", text: "Lami!" },
        { label: "I want water", text: "Karuyag ko hin tubig" },
        { label: "Check, please", text: "Palihug an bill" },
      ],
    },
  ],
  // PANGASINAN
  Pangasinan: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Maong ya abak" },
        { label: "Good afternoon", text: "Maong ya awro" },
        { label: "Good evening", text: "Maong ya labi" },
        { label: "Welcome", text: "Maong ya panablaag" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Ligay ak ed akilala tako" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat" },
        { label: "You're welcome", text: "Ala so antoy" },
        { label: "Sorry", text: "Dispensiya" },
        { label: "Excuse me", text: "Makilabas la" },
        { label: "Goodbye", text: "Umay ak la" },
        { label: "Take care", text: "Mangalaga ka" },
        { label: "I don't understand", text: "Ali ak kaawatan" },
        { label: "Yes", text: "Wa" },
        { label: "No", text: "Ali" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Anong ngaran mo?" },
        { label: "Where are you from?", text: "Tagaan ka?" },
        { label: "How much is this?", text: "Pira lay daytoy?" },
        { label: "Where is...?", text: "Ayan so...?" },
        { label: "Can you help me?", text: "Makabantoy ka ed sikato?" },
        { label: "What time is it?", text: "Anong oras na?" },
        { label: "Do you speak English?", text: "Makasao ka ed English?" },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Panmano" },
        { label: "Bahala na", text: "Bahala la" },
        { label: "Pakikisama", text: "Pakisama" },
        { label: "Utang na loob", text: "Utang a loog" },
        { label: "Bayanihan", text: "Bayanihan" },
        { label: "Mabuhay", text: "Mabuhay!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tulong!" },
        { label: "Call a doctor", text: "Awagan yo so doktor" },
        { label: "Call the police", text: "Awagan yo so pulis" },
        { label: "I am lost", text: "Nawala ak" },
        { label: "I need help", text: "Kaawatan ko ed tulong" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gutom ak" },
        { label: "I'm thirsty", text: "Uhaw ak" },
        { label: "Delicious!", text: "Lamit!" },
        { label: "I want water", text: "Gusto ko ed danum" },
        { label: "Check, please", text: "Bayadan ko la" },
      ],
    },
  ],
  // MAGUINDANAO
  Maguindanao: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Assalamu Alaykum" },
        { label: "Good morning", text: "Mapiya kapipita" },
        { label: "Good afternoon", text: "Mapiya kawagtonga" },
        { label: "Good evening", text: "Mapiya kalunsay" },
        { label: "Welcome", text: "Sukran sa pagdateng" },
        { label: "How are you?", text: "Kumusta kaw?" },
        { label: "Nice to meet you", text: "Mapia na makailanta" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Sukran" },
        { label: "You're welcome", text: "Walay sapayan" },
        { label: "Sorry", text: "Kandol" },
        { label: "Excuse me", text: "Pasensya" },
        { label: "Goodbye", text: "Sampay ko" },
        { label: "Take care", text: "Pag-iingat kaw" },
        { label: "I don't understand", text: "Ali ako kasambay" },
        { label: "Yes", text: "Oo" },
        { label: "No", text: "Dili" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Anto ngaran nu?" },
        { label: "Where are you from?", text: "Taga-dtag nu?" },
        { label: "How much is this?", text: "Pila ini?" },
        { label: "Where is...?", text: "Kanan sa...?" },
        { label: "Can you help me?", text: "Makabulig kaw sa akin?" },
        { label: "What time is it?", text: "Pira na oras?" },
        { label: "Do you speak English?", text: "Makabebend ka sa English?" },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Pagmano" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pakisama" },
        { label: "Utang na loob", text: "Utang a loog" },
        { label: "Bayanihan", text: "Tinabangay" },
        { label: "Mabuhay", text: "Mabuhi!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tabang!" },
        { label: "Call a doctor", text: "Awag a doktor" },
        { label: "Call the police", text: "Awag a pulis" },
        { label: "I am lost", text: "Nawala ako" },
        { label: "I need help", text: "Kailangan ko sa tabang" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gutom ako" },
        { label: "I'm thirsty", text: "Uhawan ako" },
        { label: "Delicious!", text: "Lami!" },
        { label: "I want water", text: "Gusto ko sa danum" },
        { label: "Check, please", text: "Paki-bayad" },
      ],
    },
  ],
  // KAPAMPANGAN
  Kapampangan: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Mayap a abak" },
        { label: "Good afternoon", text: "Mayap a gatpanapun" },
        { label: "Good evening", text: "Mayap a bengi" },
        { label: "Welcome", text: "Malaus kayu" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Mayap ing akakit da ka" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Dakal a salamat" },
        { label: "You're welcome", text: "Walang anuman" },
        { label: "Sorry", text: "Patawaran mo ku" },
        { label: "Excuse me", text: "Pakisabi" },
        { label: "Goodbye", text: "Páman" },
        { label: "Take care", text: "Mimingat ka" },
        { label: "I don't understand", text: "Ali ku akasanting" },
        { label: "Yes", text: "Wa" },
        { label: "No", text: "Ali" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Nanu ya ing lagyu mu?" },
        { label: "Where are you from?", text: "Taga-nu ka?" },
        { label: "How much is this?", text: "Magkanu ini?" },
        { label: "Where is...?", text: "Nukarin ya ing...?" },
        { label: "Can you help me?", text: "Malyari mu kung tulungan?" },
        { label: "What time is it?", text: "Nanu oras na?" },
        {
          label: "Do you speak English?",
          text: "Magsalita ka ba king English?",
        },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Makipagmano" },
        { label: "Bahala na", text: "Bahala ne" },
        { label: "Pakikisama", text: "Pakisama" },
        { label: "Utang na loob", text: "Utang a lub" },
        { label: "Bayanihan", text: "Tulung-tulung" },
        { label: "Mabuhay", text: "Mabie!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Saklulu!" },
        { label: "Call a doctor", text: "Tawagan yu ing doctor" },
        { label: "Call the police", text: "Tawagan yu ing pulis" },
        { label: "I am lost", text: "Meawala ku" },
        { label: "I need help", text: "Kailangan ku ing saklulu" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gutom ku" },
        { label: "I'm thirsty", text: "Uhaw ku" },
        { label: "Delicious!", text: "Manyaman!" },
        { label: "I want water", text: "Buri ku tubig" },
        { label: "Check, please", text: "Pakibayad" },
      ],
    },
  ],
  // BISAYA
  Bisaya: [
    {
      category: "Greetings",
      phrases: [
        { label: "Hello", text: "Kumusta" },
        { label: "Good morning", text: "Maayong buntag" },
        { label: "Good afternoon", text: "Maayong hapon" },
        { label: "Good evening", text: "Maayong gabii" },
        { label: "Welcome", text: "Maayong pag-abot" },
        { label: "How are you?", text: "Kumusta ka?" },
        { label: "Nice to meet you", text: "Maayong makaila nimo" },
      ],
    },
    {
      category: "Common Expressions",
      phrases: [
        { label: "Thank you", text: "Salamat" },
        { label: "You're welcome", text: "Walay sapayan" },
        { label: "Sorry", text: "Pasayloa ko" },
        { label: "Excuse me", text: "Paagi ko" },
        { label: "Goodbye", text: "Amping" },
        { label: "Take care", text: "Pag-amping" },
        { label: "I don't understand", text: "Wala ko kasabot" },
        { label: "Yes", text: "Oo" },
        { label: "No", text: "Dili" },
      ],
    },
    {
      category: "Questions",
      phrases: [
        { label: "What's your name?", text: "Unsa imong pangalan?" },
        { label: "Where are you from?", text: "Taga-asa ka?" },
        { label: "How much is this?", text: "Tagpila kini?" },
        { label: "Where is...?", text: "Asa ang...?" },
        { label: "Can you help me?", text: "Makatabang ka nako?" },
        { label: "What time is it?", text: "Unsa na orasa?" },
        {
          label: "Do you speak English?",
          text: "Makasulti ka ba og Iningles?",
        },
      ],
    },
    {
      category: "Cultural",
      phrases: [
        { label: "Mano po", text: "Pagmano" },
        { label: "Bahala na", text: "Bahala na" },
        { label: "Pakikisama", text: "Pag-uyon" },
        { label: "Utang na loob", text: "Utang kabubut-on" },
        { label: "Bayanihan", text: "Tinabangay" },
        { label: "Mabuhay", text: "Mabuhi!" },
      ],
    },
    {
      category: "Emergency",
      phrases: [
        { label: "Help!", text: "Tabang!" },
        { label: "Call a doctor", text: "Tawaga ang doktor" },
        { label: "Call the police", text: "Tawaga ang pulis" },
        { label: "I am lost", text: "Nawala ko" },
        { label: "I need help", text: "Nanginahanglan ko og tabang" },
      ],
    },
    {
      category: "Food & Dining",
      phrases: [
        { label: "I'm hungry", text: "Gigutom ko" },
        { label: "I'm thirsty", text: "Giuhaw ko" },
        { label: "Delicious!", text: "Lami!" },
        { label: "I want water", text: "Gusto ko og tubig" },
        { label: "Check, please", text: "Palihug og bill" },
      ],
    },
  ],
};

export default QUICK_PHRASES;
