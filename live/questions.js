(function(){
  'use strict';

  const questions=[];
  let seed=0;

  function makeVariant(question,correct,wrong){
    const unique=[correct,...wrong].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4);
    if(unique.length!==4)throw new Error('Each quiz question needs four unique answers: '+question);
    const shift=seed%4;
    const answers=unique.slice(shift).concat(unique.slice(0,shift));
    return {question,answers,correct:answers.indexOf(correct)};
  }

  function add(category,jQuestion,jCorrect,jWrong,sQuestion,sCorrect,sWrong){
    seed+=1;
    questions.push({
      id:'q'+String(seed).padStart(3,'0'),
      category,
      junior:makeVariant(jQuestion,jCorrect,jWrong),
      standard:makeVariant(sQuestion,sCorrect,sWrong)
    });
  }

  // ---------------- General Knowledge ----------------
  add('General Knowledge','How many days are in a week?','7',['5','6','8'],'How many days are in a leap year?','366',['364','365','367']);
  add('General Knowledge','How many months are in a year?','12',['10','11','13'],'How many months are in a quarter of a year?','3',['2','4','6']);
  add('General Knowledge','How many sides does a triangle have?','3',['2','4','5'],'How many sides does a hexagon have?','6',['5','7','8']);
  add('General Knowledge','How many minutes are in one hour?','60',['30','50','100'],'How many minutes are in two and a half hours?','150',['120','130','180']);
  add('General Knowledge','How many items are in a dozen?','12',['10','20','24'],'How many items are in a score?','20',['10','12','25']);
  add('General Knowledge','Which colour do you get by mixing red and yellow paint?','Orange',['Green','Purple','Blue'],'Which two colours make green paint?','Blue and yellow',['Red and blue','Red and yellow','Black and white']);
  add('General Knowledge','Which shape has four equal sides?','Square',['Triangle','Circle','Pentagon'],'Which quadrilateral has all four sides equal and opposite sides parallel?','Rhombus',['Trapezium','Kite','Rectangle']);
  add('General Knowledge','What comes after Friday?','Saturday',['Sunday','Thursday','Monday'],'Which day comes exactly three days after Monday?','Thursday',['Wednesday','Friday','Saturday']);
  add('General Knowledge','What is 10 + 5?','15',['10','20','25'],'What is 12 × 8?','96',['84','88','108']);
  add('General Knowledge','What is half of 20?','10',['5','15','20'],'What is 25% of 80?','20',['10','25','40']);
  add('General Knowledge','Which is the largest number?','100',['10','50','90'],'Which of these is a prime number?','29',['21','27','33']);
  add('General Knowledge','What is the opposite of hot?','Cold',['Fast','Tall','Loud'],'Which word is the opposite of ancient?','Modern',['Fragile','Distant','Silent']);
  add('General Knowledge','Which letter comes after B?','C',['A','D','E'],'How many letters are in the modern English alphabet?','26',['24','25','28']);
  add('General Knowledge','Which punctuation mark ends a question?','Question mark',['Comma','Full stop','Colon'],'Which punctuation mark is commonly used to show possession?','Apostrophe',['Semicolon','Hyphen','Slash']);
  add('General Knowledge','What do you use to tell the time?','Clock',['Plate','Brush','Pillow'],'What does “a.m.” refer to?','Before midday',['After midnight only','After midday','At midnight']);
  add('General Knowledge','Which season follows spring in the UK?','Summer',['Autumn','Winter','Spring'],'In the Northern Hemisphere, which month contains the summer solstice?','June',['March','September','December']);
  add('General Knowledge','Which number is even?','8',['3','5','7'],'Which number is divisible by both 3 and 4?','24',['18','20','28']);
  add('General Knowledge','Which is heavier: 1 kg or 500 g?','1 kg',['500 g','They are equal','It depends'],'How many grams are in 2.5 kilograms?','2500',['250','2000','5000']);
  add('General Knowledge','How many centimetres are in one metre?','100',['10','50','1000'],'How many metres are in 3.5 kilometres?','3500',['350','3000','35000']);
  add('General Knowledge','What is the first month of the year?','January',['March','June','December'],'Which month has 28 days in every year?','All of them',['February only','January only','None']);
  add('General Knowledge','Which of these is used for writing?','Pencil',['Spoon','Sock','Cup'],'What is graphite commonly used for?','Pencil cores',['Glass bottles','Rubber tyres','Cotton fabric']);
  add('General Knowledge','Which is a musical instrument?','Piano',['Helmet','Ladder','Kettle'],'Which family of instruments does a trumpet belong to?','Brass',['Woodwind','Strings','Percussion']);
  add('General Knowledge','Which object is designed to keep rain off you?','Umbrella',['Blanket','Fork','Remote'],'What does a barometer measure?','Air pressure',['Humidity','Wind speed','Rainfall']);
  add('General Knowledge','Which is usually used to unlock a door?','Key',['Coin','Shoe','Plate'],'What is a combination lock opened with?','A sequence of numbers or symbols',['A fingerprint only','A house key only','A magnet only']);
  add('General Knowledge','Which meal is usually eaten in the morning?','Breakfast',['Dinner','Supper','Dessert'],'What does “brunch” combine?','Breakfast and lunch',['Breakfast and dinner','Lunch and supper','Tea and dessert']);

  // ---------------- Animals ----------------
  add('Animals','What is a baby dog called?','Puppy',['Kitten','Calf','Foal'],'Which animal’s young is called a puppy?','Dog',['Cat','Horse','Goat']);
  add('Animals','What is a baby cat called?','Kitten',['Puppy','Lamb','Chick'],'Which animal’s young is called a kitten?','Cat',['Dog','Sheep','Duck']);
  add('Animals','What is a baby sheep called?','Lamb',['Kid','Foal','Cub'],'Which adult animal is the parent of a lamb?','Sheep',['Goat','Horse','Pig']);
  add('Animals','What is a baby goat called?','Kid',['Lamb','Calf','Pup'],'Which animal’s young is called a kid?','Goat',['Cow','Seal','Deer']);
  add('Animals','What is a baby horse called?','Foal',['Fawn','Cub','Chick'],'Which animal’s young is called a foal?','Horse',['Deer','Lion','Chicken']);
  add('Animals','What is a baby cow called?','Calf',['Kid','Joey','Pup'],'Which animal’s young is called a calf?','Cow',['Kangaroo','Goat','Seal']);
  add('Animals','What is a baby pig called?','Piglet',['Puppy','Lamb','Foal'],'Which animal’s young is called a piglet?','Pig',['Dog','Sheep','Horse']);
  add('Animals','What is a baby chicken called?','Chick',['Duckling','Cub','Fawn'],'Which animal hatches a chick from its egg?','Chicken',['Rabbit','Cow','Horse']);
  add('Animals','What is a baby duck called?','Duckling',['Gosling','Kitten','Calf'],'Which bird’s young is called a duckling?','Duck',['Goose','Swan','Owl']);
  add('Animals','What is a baby deer called?','Fawn',['Foal','Kid','Cub'],'Which animal’s young is called a fawn?','Deer',['Horse','Goat','Tiger']);
  add('Animals','What is a baby kangaroo called?','Joey',['Pup','Calf','Chick'],'Which animal carries a joey in a pouch?','Kangaroo',['Elephant','Seal','Giraffe']);
  add('Animals','What is a baby swan called?','Cygnet',['Gosling','Duckling','Chick'],'A cygnet grows into which bird?','Swan',['Goose','Duck','Eagle']);
  add('Animals','What is a baby goose called?','Gosling',['Cygnet','Fawn','Foal'],'A gosling grows into which bird?','Goose',['Swan','Duck','Penguin']);
  add('Animals','What is a baby seal called?','Pup',['Cub','Kid','Lamb'],'Which marine mammal’s young is commonly called a pup?','Seal',['Whale','Dolphin','Manatee']);
  add('Animals','What does a caterpillar turn into?','Butterfly',['Frog','Spider','Bee'],'What is the transformation from caterpillar to butterfly called?','Metamorphosis',['Migration','Hibernation','Pollination']);
  add('Animals','Which animal has a trunk?','Elephant',['Giraffe','Zebra','Lion'],'Which living land animal is the largest by mass?','African bush elephant',['Giraffe','White rhinoceros','Hippopotamus']);
  add('Animals','Which animal is famous for black and white stripes?','Zebra',['Tiger','Panda','Leopard'],'A zebra belongs to the same animal family as which domestic animal?','Horse',['Cow','Dog','Sheep']);
  add('Animals','Which animal has a very long neck?','Giraffe',['Hippo','Wolf','Badger'],'How many neck vertebrae does a giraffe typically have?','7',['12','18','24']);
  add('Animals','Which animal is known for building dams?','Beaver',['Otter','Fox','Rabbit'],'Beavers mainly build dams using wood, mud and what else?','Stones',['Feathers','Shells','Sand only']);
  add('Animals','Which animal can change colour to help blend in?','Chameleon',['Penguin','Horse','Dolphin'],'A chameleon changes colour mainly using specialised cells in what?','Its skin',['Its bones','Its blood','Its lungs']);
  add('Animals','Which animal is the fastest on land?','Cheetah',['Lion','Horse','Greyhound'],'Which adaptation helps a cheetah accelerate rapidly?','A flexible spine',['Webbed feet','A shell','Hollow horns']);
  add('Animals','Which of these is a mammal?','Dolphin',['Shark','Trout','Octopus'],'How do dolphins breathe?','Through lungs via a blowhole',['Through gills','Through their skin only','Through fins']);
  add('Animals','Which bird cannot fly but is an excellent swimmer?','Penguin',['Eagle','Robin','Sparrow'],'Most penguin species live naturally in which hemisphere?','Southern Hemisphere',['Northern Hemisphere','Both equally','Only on the Equator']);
  add('Animals','How many legs does a spider have?','8',['4','6','10'],'Spiders belong to which animal group?','Arachnids',['Insects','Crustaceans','Amphibians']);
  add('Animals','How many arms does an octopus have?','8',['6','10','12'],'What colour is an octopus’s blood?','Blue',['Red','Green','Clear']);

  // ---------------- Science & Space ----------------
  const elements=[
    ['Hydrogen','H'],['Helium','He'],['Carbon','C'],['Nitrogen','N'],['Oxygen','O'],['Sodium','Na'],['Magnesium','Mg'],['Aluminium','Al'],['Silicon','Si'],['Chlorine','Cl'],['Potassium','K'],['Calcium','Ca'],['Iron','Fe'],['Copper','Cu'],['Silver','Ag'],['Gold','Au'],['Mercury','Hg'],['Lead','Pb'],['Tin','Sn'],['Zinc','Zn']
  ];
  elements.forEach((item,i)=>{
    const next=[elements[(i+3)%elements.length],elements[(i+7)%elements.length],elements[(i+11)%elements.length]];
    add('Science & Space',
      'Which symbol stands for '+item[0]+'?',item[1],next.map(x=>x[1]),
      'Which element has the chemical symbol '+item[1]+'?',item[0],next.map(x=>x[0]));
  });
  add('Science & Space','Which planet do we live on?','Earth',['Mars','Venus','Jupiter'],'Which planet is the densest in the Solar System?','Earth',['Saturn','Mars','Uranus']);
  add('Science & Space','Which planet is known as the Red Planet?','Mars',['Mercury','Neptune','Saturn'],'Olympus Mons, the Solar System’s largest volcano, is on which planet?','Mars',['Venus','Earth','Jupiter']);
  add('Science & Space','Which planet is famous for its bright rings?','Saturn',['Mars','Venus','Mercury'],'Which planet has the lowest average density?','Saturn',['Earth','Mars','Neptune']);
  add('Science & Space','Which planet is closest to the Sun?','Mercury',['Earth','Mars','Neptune'],'Which planet has the shortest year?','Mercury',['Venus','Earth','Mars']);
  add('Science & Space','Which planet is the largest?','Jupiter',['Earth','Mars','Venus'],'The Great Red Spot is a storm on which planet?','Jupiter',['Saturn','Neptune','Mars']);
  add('Science & Space','What is the name of Earth’s natural satellite?','The Moon',['The Sun','Mars','Titan'],'Approximately how long does the Moon take to orbit Earth?','27 days',['7 days','90 days','365 days']);
  add('Science & Space','What star is at the centre of our Solar System?','The Sun',['Sirius','Polaris','Betelgeuse'],'What type of star is the Sun?','G-type main-sequence star',['Red supergiant','White dwarf','Neutron star']);
  add('Science & Space','What force pulls objects toward Earth?','Gravity',['Magnetism','Friction','Electricity'],'Who formulated the law of universal gravitation?','Isaac Newton',['Albert Einstein','Galileo Galilei','Marie Curie']);
  add('Science & Space','At what temperature does water freeze in Celsius?','0°C',['10°C','50°C','100°C'],'At standard atmospheric pressure, at what temperature does pure water boil?','100°C',['0°C','50°C','212°C']);
  add('Science & Space','Which organ pumps blood around your body?','Heart',['Lungs','Stomach','Kidneys'],'Which chamber pumps oxygenated blood into the aorta?','Left ventricle',['Right ventricle','Left atrium','Right atrium']);

  // ---------------- Geography ----------------
  const geo=[
    ['United Kingdom','London'],['France','Paris'],['Germany','Berlin'],['Italy','Rome'],['Spain','Madrid'],['Portugal','Lisbon'],['Ireland','Dublin'],['Netherlands','Amsterdam'],['Belgium','Brussels'],['Norway','Oslo'],['Sweden','Stockholm'],['Denmark','Copenhagen'],['Finland','Helsinki'],['Poland','Warsaw'],['Greece','Athens'],['Austria','Vienna'],['Switzerland','Bern'],['Czechia','Prague'],['Hungary','Budapest'],['Romania','Bucharest'],['Canada','Ottawa'],['United States','Washington, D.C.'],['Mexico','Mexico City'],['Brazil','Brasília'],['Argentina','Buenos Aires'],['Japan','Tokyo'],['China','Beijing'],['India','New Delhi'],['Australia','Canberra'],['New Zealand','Wellington']
  ];
  geo.forEach((item,i)=>{
    const next=[geo[(i+5)%geo.length],geo[(i+11)%geo.length],geo[(i+17)%geo.length]];
    add('Geography',
      'Which country has '+item[1]+' as its capital?',item[0],next.map(x=>x[0]),
      'What is the capital of '+item[0]+'?',item[1],next.map(x=>x[1]));
  });

  // ---------------- History ----------------
  add('History','Which ancient people built the pyramids at Giza?','Ancient Egyptians',['Romans','Vikings','Aztecs'],'The Great Pyramid at Giza was built as a tomb for which pharaoh?','Khufu',['Tutankhamun','Ramesses II','Akhenaten']);
  add('History','Which ancient civilisation used gladiators in arenas?','Romans',['Vikings','Maya','Victorians'],'Which Roman amphitheatre is one of the best-known in the world?','The Colosseum',['The Parthenon','Stonehenge','The Acropolis']);
  add('History','Which people sailed longships from Scandinavia?','Vikings',['Romans','Samurai','Aztecs'],'The Viking Age is commonly dated as beginning with the raid on Lindisfarne in which year?','793',['43','1066','1215']);
  add('History','Who was the first Tudor king of England?','Henry VII',['Henry VIII','Richard III','Edward VI'],'Which battle in 1485 brought Henry VII to the throne?','Battle of Bosworth Field',['Battle of Hastings','Battle of Agincourt','Battle of Waterloo']);
  add('History','Which king had six wives?','Henry VIII',['Henry V','George III','Charles II'],'Which of Henry VIII’s wives was the mother of Elizabeth I?','Anne Boleyn',['Catherine of Aragon','Jane Seymour','Catherine Parr']);
  add('History','Who was Queen of England when the Spanish Armada sailed in 1588?','Elizabeth I',['Victoria','Mary I','Anne'],'In which year was the Spanish Armada defeated?','1588',['1485','1605','1666']);
  add('History','What happened in London in 1666?','The Great Fire of London',['The Battle of Hastings','The Gunpowder Plot','The first Moon landing'],'Where did the Great Fire of London begin?','Pudding Lane',['Baker Street','Fleet Street','Downing Street']);
  add('History','Who tried to blow up Parliament in the Gunpowder Plot?','Guy Fawkes and other conspirators',['Isaac Newton','William Shakespeare','Horatio Nelson'],'In which year was the Gunpowder Plot discovered?','1605',['1588','1666','1707']);
  add('History','Which battle happened in England in 1066?','Battle of Hastings',['Battle of Waterloo','Battle of Trafalgar','Battle of Britain'],'Who won the Battle of Hastings?','William the Conqueror',['Harold Godwinson','Richard the Lionheart','Alfred the Great']);
  add('History','Which document was sealed by King John in 1215?','Magna Carta',['Domesday Book','Bill of Rights','Treaty of Versailles'],'Where was Magna Carta sealed?','Runnymede',['Canterbury','York','Winchester']);
  add('History','Which famous playwright wrote Hamlet?','William Shakespeare',['Charles Dickens','J. R. R. Tolkien','Roald Dahl'],'In which English town was Shakespeare born?','Stratford-upon-Avon',['Oxford','Bath','Canterbury']);
  add('History','Who was famous for discovering penicillin?','Alexander Fleming',['Isaac Newton','Charles Darwin','Alan Turing'],'In which year did Fleming discover penicillin?','1928',['1914','1939','1953']);
  add('History','Who developed the theory of evolution by natural selection?','Charles Darwin',['Isaac Newton','Louis Pasteur','Nikola Tesla'],'Darwin’s On the Origin of Species was published in which year?','1859',['1776','1815','1901']);
  add('History','Who was the first person to walk on the Moon?','Neil Armstrong',['Buzz Aldrin','Yuri Gagarin','John Glenn'],'Apollo 11 landed on the Moon in which year?','1969',['1957','1965','1972']);
  add('History','Who was the first human in space?','Yuri Gagarin',['Neil Armstrong','Buzz Aldrin','Valentina Tereshkova'],'Gagarin’s spacecraft was called what?','Vostok 1',['Apollo 11','Sputnik 1','Soyuz 11']);
  add('History','Which ship sank on its first voyage in 1912?','Titanic',['Victory','Mayflower','Endeavour'],'Titanic sank after striking what?','An iceberg',['A reef','Another ship','A mine']);
  add('History','Which war ended in Europe in 1945?','Second World War',['First World War','Crimean War','Seven Years’ War'],'VE Day marks Germany’s surrender in Europe on which date?','8 May 1945',['11 November 1918','6 June 1944','2 September 1945']);
  add('History','What was the name of the operation for the Allied landings in Normandy in 1944?','D-Day',['Dunkirk','Market Garden','Barbarossa'],'D-Day took place on which date?','6 June 1944',['8 May 1945','1 September 1939','11 November 1918']);
  add('History','Which nurse became known as “The Lady with the Lamp”?','Florence Nightingale',['Mary Seacole','Marie Curie','Emmeline Pankhurst'],'Nightingale became famous for her work during which war?','Crimean War',['Boer War','First World War','Napoleonic Wars']);
  add('History','Which scientist is linked with the story of a falling apple and gravity?','Isaac Newton',['Charles Darwin','Albert Einstein','Michael Faraday'],'Newton’s Principia was first published in which century?','17th century',['15th century','19th century','20th century']);
  add('History','Which ancient Greek city is associated with the first Olympic Games?','Olympia',['Athens','Sparta','Corinth'],'The ancient Olympic Games were held in honour of which Greek god?','Zeus',['Apollo','Poseidon','Hermes']);
  add('History','Which civilisation built Machu Picchu?','Inca',['Roman','Viking','Egyptian'],'Machu Picchu is in which modern country?','Peru',['Mexico','Chile','Brazil']);
  add('History','Which civilisation built Chichén Itzá?','Maya',['Inca','Roman','Viking'],'Chichén Itzá is in which modern country?','Mexico',['Peru','Egypt','Greece']);
  add('History','Who was the British prime minister for most of the Second World War?','Winston Churchill',['Clement Attlee','Neville Chamberlain','Harold Wilson'],'Churchill first became prime minister in which year?','1940',['1935','1945','1951']);
  add('History','Which woman became the first female prime minister of the UK?','Margaret Thatcher',['Theresa May','Queen Victoria','Barbara Castle'],'In which year did Margaret Thatcher first become prime minister?','1979',['1969','1989','1997']);

  // ---------------- Sport ----------------
  add('Sport','How many players does a football team have on the pitch at the start?','11',['9','10','12'],'How far is the penalty spot from the goal line in association football?','12 yards',['10 yards','15 yards','18 yards']);
  add('Sport','What colour card sends a football player off?','Red',['Yellow','Blue','Green'],'How many yellow cards in the same match normally lead to a sending-off?','2',['1','3','4']);
  add('Sport','What do you call three goals by one player in a football match?','Hat-trick',['Grand slam','Turkey','Century'],'A “clean sheet” in football means what?','Conceding no goals',['Scoring three goals','No fouls committed','Winning by one goal']);
  add('Sport','How many points is a try worth in rugby union?','5',['3','6','7'],'How many players start on the field for one rugby union team?','15',['11','13','16']);
  add('Sport','How many players start on the field for one rugby league team?','13',['11','15','16'],'How many points is a try worth in rugby league?','4',['3','5','6']);
  add('Sport','How many players are on court for one basketball team?','5',['6','7','11'],'How many points is a free throw worth in basketball?','1',['2','3','4']);
  add('Sport','How many players are on court for one netball team?','7',['5','6','8'],'Which netball positions are allowed to shoot?','Goal Shooter and Goal Attack',['Centre and Wing Attack','Goal Keeper and Goal Defence','Wing Defence and Centre']);
  add('Sport','How many players are in a cricket team?','11',['9','10','12'],'How many legal balls are in a standard over in modern cricket?','6',['4','5','8']);
  add('Sport','What is the maximum score from one normal cricket hit without overthrows?','6 runs',['4 runs','5 runs','8 runs'],'What is a score of 100 runs by one batter called?','A century',['A hat-trick','A break','A set']);
  add('Sport','What score does “love” mean in tennis?','0',['10','15','30'],'What comes after deuce when a player wins the next point?','Advantage',['Game','Set','Break point only']);
  add('Sport','How many points are needed to win a standard tennis tie-break, with a two-point margin?','7',['5','6','10'],'How many Grand Slam tournaments are played each year in tennis?','4',['3','5','6']);
  add('Sport','In golf, what is one stroke under par on a hole called?','Birdie',['Bogey','Eagle','Par'],'What is two strokes under par on a hole called?','Eagle',['Birdie','Bogey','Albatross']);
  add('Sport','In golf, what is one stroke over par called?','Bogey',['Birdie','Eagle','Ace'],'What does “par” describe?','Expected strokes for a hole or course',['The longest drive','A penalty stroke','The number of clubs allowed']);
  add('Sport','How many rings are on the Olympic symbol?','5',['4','6','7'],'The modern Olympic Games were revived in 1896 in which city?','Athens',['Paris','London','Rome']);
  add('Sport','Which sport uses a shuttlecock?','Badminton',['Squash','Tennis','Table tennis'],'A badminton game is normally played to how many points?','21',['15','25','30']);
  add('Sport','Which sport uses a pommel horse?','Gymnastics',['Cycling','Rowing','Fencing'],'The pommel horse is an apparatus in which discipline?','Men’s artistic gymnastics',['Rhythmic gymnastics','Trampolining','Acrobatic gymnastics']);
  add('Sport','Which sport is raced in a velodrome?','Track cycling',['Rowing','Sailing','Motocross'],'How long is a standard modern Olympic velodrome track?','250 metres',['200 metres','333 metres','400 metres']);
  add('Sport','Which sport has a scrum?','Rugby',['Basketball','Tennis','Baseball'],'In rugby union, how many forwards from each team normally form a full scrum?','8',['6','7','9']);
  add('Sport','Which sport uses wickets and bats?','Cricket',['Hockey','Lacrosse','Polo'],'How many stumps make up one cricket wicket?','3',['2','4','6']);
  add('Sport','Which sport is played at Wimbledon?','Tennis',['Golf','Cricket','Badminton'],'What surface is used for the main Wimbledon championships?','Grass',['Clay','Hard court','Carpet']);
  add('Sport','Which sport features the Tour de France?','Cycling',['Running','Motor racing','Skiing'],'What colour jersey is worn by the overall Tour de France leader?','Yellow',['Green','White','Red']);
  add('Sport','Which motorsport series awards the Formula One World Championship?','Formula 1',['MotoGP','IndyCar','WRC'],'What flag signals the end of a motor race?','Chequered flag',['Yellow flag','Blue flag','Red flag']);
  add('Sport','Which sport uses a puck?','Ice hockey',['Field hockey','Lacrosse','Curling'],'How many skaters per team are normally on the ice in ice hockey including the goalie?','6',['5','7','11']);
  add('Sport','Which sport uses stones and sweeping on ice?','Curling',['Ice hockey','Speed skating','Bobsleigh'],'What is the circular target in curling called?','House',['Crease','Ring','Zone']);
  add('Sport','Which sport includes the 100 metre sprint?','Athletics',['Cycling','Swimming','Rowing'],'How many laps of a standard 400 m outdoor track make 5,000 m?','12.5',['10','12','15']);

  // ---------------- Film, TV & Games ----------------
  add('Film, TV & Games','What kind of toy is Buzz Lightyear?','Space ranger',['Cowboy','Dinosaur','Robot dog'],'In Toy Story, what is the name of Andy’s cowboy doll?','Woody',['Jessie','Stinky Pete','Bullseye']);
  add('Film, TV & Games','What colour is Lightning McQueen mainly?','Red',['Blue','Green','Yellow'],'What racing number does Lightning McQueen use for most of the Cars films?','95',['51','43','86']);
  add('Film, TV & Games','Who is Simba’s father in The Lion King?','Mufasa',['Scar','Timon','Rafiki'],'What is the name of Simba’s uncle?','Scar',['Zazu','Pumbaa','Nala']);
  add('Film, TV & Games','What kind of fish is Nemo?','Clownfish',['Shark','Tuna','Goldfish'],'In Finding Nemo, what is Dory’s key memory problem?','Short-term memory loss',['She cannot see colours','She cannot swim','She is afraid of water']);
  add('Film, TV & Games','Who is Elsa’s sister in Frozen?','Anna',['Moana','Ariel','Belle'],'What is the name of the kingdom in Frozen?','Arendelle',['Corona','Agrabah','Atlantica']);
  add('Film, TV & Games','Which Disney character has very long magical hair?','Rapunzel',['Mulan','Merida','Jasmine'],'In Tangled, what is the name of Rapunzel’s chameleon?','Pascal',['Flounder','Sebastian','Meeko']);
  add('Film, TV & Games','Who is the demigod in Moana?','Maui',['Hercules','Aladdin','Kristoff'],'What magical object does Moana return to Te Fiti?','Her heart',['A crown','A trident','A golden apple']);
  add('Film, TV & Games','Which princess has a tiger called Rajah?','Jasmine',['Belle','Ariel','Tiana'],'In Aladdin, what is the name of the city where the story is mainly set?','Agrabah',['Arendelle','Motunui','Corona']);
  add('Film, TV & Games','Which character lives in a pineapple under the sea?','SpongeBob SquarePants',['Patrick Star','Peppa Pig','Scooby-Doo'],'What is the name of SpongeBob’s workplace?','The Krusty Krab',['The Chum Bucket','Bikini Café','Jellyfish Grill']);
  add('Film, TV & Games','What type of animal is Bluey?','Dog',['Cat','Rabbit','Bear'],'Bluey’s family are which breed of dog?','Blue Heelers',['Labradors','Beagles','Dalmatians']);
  add('Film, TV & Games','Which superhero is also called Peter Parker?','Spider-Man',['Batman','Superman','Iron Man'],'Which newspaper does Peter Parker often work for in Spider-Man stories?','Daily Bugle',['Daily Planet','Gotham Gazette','New York Bulletin']);
  add('Film, TV & Games','Which superhero is Bruce Wayne?','Batman',['Thor','Hulk','Flash'],'What is the name of Batman’s home city?','Gotham City',['Metropolis','Central City','Star City']);
  add('Film, TV & Games','Which superhero uses a shield with a star?','Captain America',['Hawkeye','Thor','Ant-Man'],'What is Captain America’s real name?','Steve Rogers',['Tony Stark','Bruce Banner','Clint Barton']);
  add('Film, TV & Games','What is Iron Man’s real name?','Tony Stark',['Peter Parker','Steve Rogers','Bruce Wayne'],'What company is associated with Tony Stark?','Stark Industries',['Wayne Enterprises','Oscorp','Daily Planet']);
  add('Film, TV & Games','What school does Harry Potter attend?','Hogwarts',['Narnia Academy','Nevermore','Xavier School'],'Which house is Harry Potter sorted into?','Gryffindor',['Slytherin','Ravenclaw','Hufflepuff']);
  add('Film, TV & Games','What sport is played on broomsticks in Harry Potter?','Quidditch',['Quaffleball','Wizardball','Broom polo'],'How many goal hoops does each Quidditch team defend in the books?','3',['1','2','4']);
  add('Film, TV & Games','Which video game character is a plumber in a red cap?','Mario',['Sonic','Link','Kirby'],'What is the name of Mario’s brother?','Luigi',['Wario','Toad','Yoshi']);
  add('Film, TV & Games','Which blue video game character is famous for running very fast?','Sonic',['Mario','Kirby','Pikachu'],'What company originally created Sonic the Hedgehog?','Sega',['Nintendo','Sony','Atari']);
  add('Film, TV & Games','Which Pokémon is yellow and has a lightning-bolt-shaped tail?','Pikachu',['Squirtle','Bulbasaur','Charmander'],'What type is Pikachu?','Electric',['Fire','Water','Grass']);
  add('Film, TV & Games','In Minecraft, which creature explodes near players?','Creeper',['Villager','Sheep','Skeleton horse'],'Which material is needed to build a Nether portal frame?','Obsidian',['Bedrock','Diamond blocks','Redstone']);
  add('Film, TV & Games','In Fortnite, what closes in to make the safe area smaller?','The Storm',['The Fog','The Wall','The Tide'],'What genre best describes Fortnite Battle Royale?','Battle royale',['Turn-based strategy','Racing simulator','Puzzle platformer']);
  add('Film, TV & Games','Which game console is made by Nintendo?','Switch',['PlayStation 5','Xbox Series X','Steam Deck'],'What is the name of Nintendo’s motion-control console released in 2006?','Wii',['GameCube','Dreamcast','Vita']);
  add('Film, TV & Games','Which game series features Master Chief?','Halo',['Zelda','Gran Turismo','Animal Crossing'],'Master Chief is primarily associated with which console brand?','Xbox',['PlayStation','Nintendo','Atari']);
  add('Film, TV & Games','Which film series features Jedi and lightsabers?','Star Wars',['Star Trek','Harry Potter','Jurassic Park'],'What is the name of Han Solo’s ship?','Millennium Falcon',['X-wing','Star Destroyer','Razor Crest']);
  add('Film, TV & Games','Which film features dinosaurs in a theme park?','Jurassic Park',['Jaws','Avatar','Back to the Future'],'Who directed the original 1993 Jurassic Park film?','Steven Spielberg',['James Cameron','George Lucas','Ridley Scott']);

  // ---------------- UK & Everyday ----------------
  add('UK & Everyday','What is the capital of England?','London',['Cardiff','Edinburgh','Belfast'],'Which river runs through central London?','River Thames',['River Severn','River Trent','River Tyne']);
  add('UK & Everyday','What is the capital of Scotland?','Edinburgh',['Glasgow','Aberdeen','Dundee'],'Edinburgh Castle stands on what type of geological feature?','An extinct volcanic rock',['A coral reef','A chalk cliff','A sand dune']);
  add('UK & Everyday','What is the capital of Wales?','Cardiff',['Swansea','Newport','Bangor'],'Which language has official status in Wales alongside English?','Welsh',['Gaelic','Cornish','Manx']);
  add('UK & Everyday','What is the capital of Northern Ireland?','Belfast',['Derry','Lisburn','Armagh'],'Which ship was built in Belfast and launched in 1911?','Titanic',['Cutty Sark','HMS Victory','Mary Rose']);
  add('UK & Everyday','How many countries make up the United Kingdom?','4',['3','5','6'],'Which of these is not part of the United Kingdom?','Republic of Ireland',['England','Scotland','Wales']);
  add('UK & Everyday','What currency is used in the United Kingdom?','Pound sterling',['Euro','Dollar','Yen'],'How many pence are in one pound?','100',['10','50','1000']);
  add('UK & Everyday','What colours are on the Union Flag?','Red, white and blue',['Red and yellow','Green and white','Blue and gold'],'The Union Flag combines crosses associated with England, Scotland and which other part of the UK?','Northern Ireland',['Wales','Isle of Man','Cornwall']);
  add('UK & Everyday','On which side of the road do people normally drive in the UK?','Left',['Right','Either side','Middle'],'What does a circular UK road sign with a red border usually indicate?','A prohibition or restriction',['Tourist information','A motorway service','A warning only']);
  add('UK & Everyday','What colour are most UK post boxes?','Red',['Blue','Green','Yellow'],'Which organisation operates the UK’s traditional red post boxes?','Royal Mail',['National Rail','DVLA','BBC']);
  add('UK & Everyday','What number can you call for UK emergency services?','999',['111','101','123'],'Which number is also accepted for emergency services in the UK and across the EU?','112',['110','118','911 only']);
  add('UK & Everyday','Which service should you call on 111 in England for?','Urgent medical help that is not a 999 emergency',['Police emergencies','Fire emergencies','Roadside breakdowns'],'NHS 111 is primarily intended for what level of need?','Urgent but non-life-threatening medical advice',['Routine dental cleaning','Passport applications','Vehicle tax']);
  add('UK & Everyday','What colour light means stop at traffic lights?','Red',['Green','Blue','White'],'What is the usual sequence after red at UK traffic lights before green?','Red and amber',['Amber only','Green and amber','Flashing green']);
  add('UK & Everyday','What colour light means go when it is safe?','Green',['Red','Amber','Purple'],'An amber traffic light normally means what?','Stop unless it is unsafe to do so',['Speed up','Parking permitted','Turn left only']);
  add('UK & Everyday','What do zebra crossings have painted across the road?','Black and white stripes',['Red circles','Blue arrows','Yellow squares'],'What flashing beacons are found at zebra crossings in the UK?','Belisha beacons',['Lighthouse beacons','Catseye lamps','Pelican lamps']);
  add('UK & Everyday','Which city is famous for the Bullring shopping centre?','Birmingham',['Leeds','Bristol','Norwich'],'Birmingham is in which English region?','West Midlands',['East Midlands','South West','North East']);
  add('UK & Everyday','Which city is famous for its cathedral ruins and a phoenix symbol after wartime rebuilding?','Coventry',['Oxford','Bath','York'],'Coventry is traditionally associated with which animal on its coat of arms?','Elephant',['Lion','Horse','Bear']);
  add('UK & Everyday','Which city is home to the Beatles?','Liverpool',['Manchester','Sheffield','Nottingham'],'Liverpool stands on which river?','River Mersey',['River Tyne','River Avon','River Ouse']);
  add('UK & Everyday','Which city is known for the Roman Baths?','Bath',['Exeter','Derby','Hull'],'Bath is in which ceremonial county?','Somerset',['Kent','Norfolk','Cumbria']);
  add('UK & Everyday','Which English city is famous for its university and “dreaming spires”?','Oxford',['Plymouth','Sunderland','Lincoln'],'Which river is also known as the Isis as it passes through Oxford?','River Thames',['River Cam','River Trent','River Wye']);
  add('UK & Everyday','What do you normally put on a letter before posting it?','Stamp',['Key','Receipt','Ticket'],'What does a UK postcode help identify?','A delivery area or address',['A person’s age','A bank balance','A phone model']);
  add('UK & Everyday','Which appliance keeps food cold?','Fridge',['Oven','Toaster','Kettle'],'What temperature is a domestic fridge commonly recommended to be kept at or below?','5°C',['10°C','15°C','20°C']);
  add('UK & Everyday','Which appliance boils water for a hot drink?','Kettle',['Freezer','Iron','Vacuum cleaner'],'A typical UK electric kettle runs from roughly what mains voltage?','230 V',['12 V','110 V','500 V']);
  add('UK & Everyday','What do you use to measure body temperature?','Thermometer',['Ruler','Compass','Barometer'],'Which temperature scale is most commonly used for everyday weather reports in the UK?','Celsius',['Fahrenheit only','Kelvin','Rankine']);
  add('UK & Everyday','Which bin is commonly used for recyclable items where local rules allow?','Recycling bin',['Laundry basket','Toolbox','Suitcase'],'Which material can usually be recycled repeatedly without losing its basic material properties?','Aluminium',['Food waste','Ceramic plates','Used tissues']);
  add('UK & Everyday','What should you do before crossing a road?','Look and listen for traffic',['Close your eyes','Run immediately','Stand in the carriageway'],'The Green Cross Code advises pedestrians to stop, look and what?','Listen',['Wave','Shout','Point']);

  // ---------------- Question Bank 2.0 ----------------
  // Questions are now individual age-rated facts. A round remains a topic card so
  // every player stays on the same topic, while resolve() chooses the closest fact
  // to that player's exact age. Ranges overlap deliberately so the game feels like
  // family entertainment rather than a rigid school-year test.
  const bank=[];
  let bankSeed=0;

  function clampAge(value){return Math.max(5,Math.min(100,Number(value)||30));}
  function rangesFor(target){
    if(target<=6)return {minAge:5,maxAge:8};
    if(target<=8)return {minAge:6,maxAge:10};
    if(target<=10)return {minAge:8,maxAge:12};
    if(target<=12)return {minAge:10,maxAge:14};
    if(target<=15)return {minAge:12,maxAge:17};
    return {minAge:15,maxAge:100};
  }
  function addRated(category,targetAge,question,correct,wrong,priority=0,idPrefix='new'){
    bankSeed+=1;
    const variant=makeVariant(question,correct,wrong),range=rangesFor(targetAge);
    bank.push({...variant,id:idPrefix+'-'+String(bankSeed).padStart(4,'0'),category,targetAge,minAge:range.minAge,maxAge:range.maxAge,priority});
  }
  function existingAge(category,tier,text){
    if(tier==='standard'){
      if(category==='General Knowledge'||category==='Geography'||category==='Sport'||category==='Film, TV & Games'||category==='UK & Everyday')return 12;
      if(category==='Animals'&&/baby|called a|young|puppy|kitten|lamb|foal|calf|chick|duckling|fawn|joey|cygnet|gosling/i.test(text))return 9;
      if(category==='Animals')return 15;
      if(category==='Science & Space'&&/symbol|element|chemical/i.test(text))return 14;
      if(category==='Science & Space')return 16;
      if(category==='History')return 17;
      return 16;
    }
    if(category==='Animals'&&/baby|called a|young|puppy|kitten|lamb|foal|calf|chick|duckling|fawn|joey|cygnet|gosling/i.test(text))return 7;
    if(category==='Science & Space'&&/symbol|element|chemical/i.test(text))return 13;
    if(category==='Geography')return 10;
    if(category==='History')return 9;
    if(category==='Sport'||category==='Film, TV & Games'||category==='UK & Everyday')return 8;
    return 9;
  }
  function repetitivePriority(category,text){
    if(category==='Science & Space'&&/symbol|element|chemical/i.test(text))return 4;
    if(category==='Geography'&&/capital/i.test(text))return 4;
    if(category==='Animals'&&/baby|young is called|grows into/i.test(text))return 3;
    return 1;
  }
  questions.forEach(card=>{
    [['junior',card.junior],['standard',card.standard]].forEach(([tier,v])=>{
      const targetAge=existingAge(card.category,tier,v.question),range=rangesFor(targetAge);
      bank.push({...v,id:card.id+'-'+tier,category:card.category,targetAge,minAge:range.minAge,maxAge:range.maxAge,priority:repetitivePriority(card.category,v.question)});
    });
  });

  const young={
    'General Knowledge':[
      ['What number comes after 4?','5',['3','6','8']],['How many fingers are on one hand?','5',['4','6','10']],['Which shape is round?','Circle',['Square','Triangle','Rectangle']],['What colour is grass usually?','Green',['Purple','Orange','Black']],['Which is the smallest number?','1',['5','8','10']],
      ['How many wheels does a bicycle usually have?','2',['1','3','4']],['What do you call water when it freezes?','Ice',['Steam','Rain','Juice']],['Which word rhymes with cat?','Hat',['Dog','Sun','Fish']],['How many eyes do most people have?','2',['1','3','4']],['What is 2 + 2?','4',['3','5','6']],
      ['Which is taller: a house or a cup?','A house',['A cup','They are equal','Neither']],['Which meal do you usually eat first in the day?','Breakfast',['Dinner','Dessert','Supper']],['What do you use to brush your teeth?','A toothbrush',['A fork','A sock','A ruler']],['Which day comes after Monday?','Tuesday',['Friday','Sunday','Saturday']],['Which season is usually the coldest?','Winter',['Summer','Spring','Autumn']],
      ['What is the opposite of big?','Small',['Fast','Loud','Long']],['How many legs does a chair usually have?','4',['2','5','8']],['Which letter starts the word apple?','A',['B','P','T']],['What is 5 minus 1?','4',['3','5','6']],['Which object tells the time?','A clock',['A plate','A pillow','A shoe']],
      ['How many sides does a square have?','4',['3','5','6']],['Which is longer: a pencil or a bus?','A bus',['A pencil','They are equal','Neither']],['What colour do red and yellow paint make?','Orange',['Blue','Green','Purple']],['Which number comes before 10?','9',['8','11','12']],['What do you use to cut paper safely?','Scissors',['A pillow','A cup','A sock']]
    ],
    'Animals':[
      ['Which animal says woof?','Dog',['Cat','Cow','Duck']],['Which animal says moo?','Cow',['Dog','Sheep','Horse']],['Which animal says meow?','Cat',['Pig','Frog','Lion']],['Which animal has a long trunk?','Elephant',['Tiger','Rabbit','Penguin']],['Which animal has black and white stripes?','Zebra',['Lion','Hippo','Giraffe']],
      ['Which animal gives us wool?','Sheep',['Duck','Dog','Mouse']],['Which animal has a shell and moves slowly?','Snail',['Cheetah','Eagle','Monkey']],['Which bird says quack?','Duck',['Owl','Robin','Parrot']],['Which animal likes bananas?','Monkey',['Shark','Sheep','Penguin']],['Which animal is very tall with a long neck?','Giraffe',['Badger','Pig','Seal']],
      ['Which animal can hop and has long ears?','Rabbit',['Cow','Cat','Fox']],['Which animal lives in water and has fins?','Fish',['Horse','Chicken','Spider']],['Which farm animal says oink?','Pig',['Goat','Duck','Dog']],['Which animal carries its baby in a pouch?','Kangaroo',['Elephant','Zebra','Dolphin']],['Which animal is known as the king of the jungle?','Lion',['Rabbit','Penguin','Cow']],
      ['How many legs does a dog have?','4',['2','6','8']],['Which animal makes honey?','Bee',['Ant','Fly','Spider']],['What does a caterpillar become?','Butterfly',['Frog','Mouse','Fish']],['Which bird cannot fly and waddles on ice?','Penguin',['Eagle','Robin','Sparrow']],['Which animal has eight arms?','Octopus',['Crab','Dolphin','Shark']],
      ['Which animal says neigh?','Horse',['Pig','Cat','Duck']],['Which animal has a mane?','Lion',['Frog','Seal','Rabbit']],['Which animal is covered in prickly spines?','Hedgehog',['Dolphin','Cow','Parrot']],['Which animal can live in a hive?','Bee',['Horse','Shark','Sheep']],['Which animal has webbed feet and a bill?','Duck',['Cat','Lion','Monkey']]
    ],
    'Science & Space':[
      ['Which planet do we live on?','Earth',['Mars','Jupiter','Venus']],['What shines in the sky during the day?','The Sun',['The Moon','Mars','A cloud']],['What often shines in the sky at night?','The Moon',['A rainbow','The Sun','A tree']],['What do plants need to drink?','Water',['Sand','Plastic','Paint']],['Which body part helps you see?','Eyes',['Ears','Feet','Elbows']],
      ['Which body part helps you hear?','Ears',['Knees','Hands','Teeth']],['Which organ beats inside your chest?','Heart',['Stomach','Lungs','Brain']],['What do we breathe in to stay alive?','Air',['Juice','Sand','Smoke']],['Which is hotter?','Fire',['Ice','Snow','A freezer']],['What falls from clouds when it rains?','Water',['Rocks','Leaves','Sand']],
      ['Which sense do you use with your nose?','Smell',['Sight','Hearing','Touch']],['What happens to ice when it gets warm?','It melts',['It grows','It freezes more','It turns to wood']],['Which planet is called the Red Planet?','Mars',['Earth','Saturn','Neptune']],['What pulls things down towards the ground?','Gravity',['Music','Wind','Light']],['Which part of a plant is usually under the ground?','Roots',['Flower','Leaf','Fruit']],
      ['Which animal starts life as a tadpole?','Frog',['Dog','Bird','Horse']],['What are clouds made from?','Tiny water droplets',['Cotton wool','Smoke only','Paper']],['Which material is attracted to a magnet?','Iron',['Wood','Glass','Paper']],['Which is a source of light?','A lamp',['A spoon','A sock','A pillow']],['What do you call water that falls as white flakes?','Snow',['Fog','Steam','Dew']],
      ['Which part of your body helps you think?','Brain',['Knee','Elbow','Toe']],['What do shadows need to form?','Light',['Music','Food','Wind']],['Which is a liquid?','Water',['Rock','Wood','Glass']],['What happens when water gets very cold?','It freezes',['It burns','It glows','It grows']],['Which object can a magnet pick up?','An iron nail',['A paper cup','A rubber ball','A wooden spoon']],
      ['What do your lungs help you do?','Breathe',['See','Taste','Walk']],['Which is a living thing?','A tree',['A chair','A stone','A spoon']],['What is the Sun: a star or a planet?','A star',['A planet','A moon','A cloud']],['Which travels around Earth?','The Moon',['The Sun every day','Mars every hour','A rainbow']],['What do seeds grow into?','Plants',['Rocks','Clouds','Plastic']]
    ],
    'Geography':[
      ['Which country do we live in?','United Kingdom',['France','Australia','Brazil']],['What is the capital city of England?','London',['Paris','Rome','Madrid']],['Which is bigger: a city or a house?','A city',['A house','They are equal','Neither']],['What is a very large area of salt water called?','An ocean',['A road','A hill','A garden']],['Which place is made of lots of sand?','A desert',['A forest','A river','A glacier']],
      ['What is land with water all around it called?','An island',['A mountain','A valley','A bridge']],['Which direction is opposite to north?','South',['East','West','Up']],['Which country is famous for the Eiffel Tower?','France',['Spain','India','Canada']],['Which country is shaped a little like a boot?','Italy',['Japan','Brazil','Norway']],['Which city is Big Ben in?','London',['Manchester','Cardiff','Belfast']],
      ['What do you cross to get over a river?','A bridge',['A tunnel only','A cloud','A field']],['Which is higher: a mountain or a beach?','A mountain',['A beach','They are always equal','Neither']],['What colour is the sea often shown on a map?','Blue',['Red','Black','Orange']],['Which continent is the United Kingdom in?','Europe',['Africa','Asia','Antarctica']],['Which country has kangaroos living in the wild?','Australia',['Germany','Mexico','Egypt']],
      ['What is a map used for?','Finding places',['Cooking food','Washing clothes','Telling jokes']],['Which city is the capital of Scotland?','Edinburgh',['Cardiff','London','Belfast']],['What is a river?','Flowing water',['A tall building','A type of road','A dry field']],['Which is colder: the North Pole or a tropical beach?','The North Pole',['A tropical beach','They are equal','Neither']],['Which country is famous for the pyramids of Giza?','Egypt',['Ireland','Japan','Norway']],
      ['Which city is the capital of Wales?','Cardiff',['London','Edinburgh','Belfast']],['Which city is the capital of Northern Ireland?','Belfast',['Cardiff','Glasgow','London']],['Which country is directly south of England across the Channel?','France',['Canada','India','Japan']],['What do we call a piece of land beside the sea?','A coast',['A planet','A cloud','A tunnel']],['What is a very high area of land called?','A mountain',['A river','A beach','A harbour']],
      ['Which continent is Egypt in?','Africa',['Europe','Australia','Antarctica']],['Where would you find lots of trees growing together?','A forest',['A desert','An ocean','A glacier']],['Which direction does the Sun appear to rise from?','East',['West','North','South']],['What is a village smaller than?','A city',['A house','A car','A person']],['Which country is famous for pandas?','China',['Italy','Brazil','Iceland']]
    ],
    'History':[
      ['Who wore crowns and ruled kingdoms?','Kings and queens',['Astronauts','Footballers','Pirates only']],['What did knights often wear for protection?','Armour',['Pyjamas','Aprons','Swimsuits']],['Which people are famous for sailing in longships?','Vikings',['Romans','Victorians','Astronauts']],['What did dinosaurs live: long ago or next year?','Long ago',['Next year','Today only','Tomorrow']],['Which ancient people built pyramids in Egypt?','Ancient Egyptians',['Vikings','Victorians','Pirates']],
      ['Where would a king or queen often live?','A castle or palace',['A bus stop','A tent only','A supermarket']],['What did people use before electric lights?','Candles',['Televisions','Tablets','Satellites']],['Which came first: castles or smartphones?','Castles',['Smartphones','They arrived together','Neither']],['Who was famous for having six wives?','Henry VIII',['William Shakespeare','Isaac Newton','Winston Churchill']],['What happened to London in 1666?','A great fire',['A moon landing','A dinosaur attack','The Olympics']],
      ['Which transport came first?','Horse and cart',['Aeroplane','Electric car','Space rocket']],['What is a museum a place for?','Learning about objects and stories',['Buying petrol','Playing football','Washing cars']],['Which famous ship sank after hitting an iceberg?','Titanic',['Mayflower','Victory','Endeavour']],['Who was the first person to walk on the Moon?','Neil Armstrong',['William Shakespeare','Henry VIII','Isaac Newton']],['What did pirates sail in?','Ships',['Trains','Bicycles','Helicopters']],
      ['Which city had ancient gladiators?','Rome',['London','New York','Sydney']],['What do we call a story about things that really happened long ago?','History',['Weather','Maths','Music']],['Which queen ruled Britain for much of the 1800s?','Queen Victoria',['Queen Anne','Elizabeth I','Mary I']],['What did Roman soldiers carry for protection?','Shields',['Umbrellas','Tennis rackets','Paint brushes']],['Which building was made to defend people from attack?','A castle',['A greenhouse','A cinema','A café']],
      ['What did people write with before pens were invented?','Quills',['Telephones','Torches','Remote controls']],['Which ancient people built roads across Britain?','Romans',['Vikings','Victorians','Aztecs']],['What powered the earliest sailing ships?','Wind',['Petrol','Electric batteries','Solar panels']],['Which came first: steam trains or aeroplanes?','Steam trains',['Aeroplanes','They arrived together','Neither']],['What do archaeologists study?','Things left by people long ago',['Tomorrow’s weather','New video games','Football scores']]
    ],
    'Sport':[
      ['What do football players kick?','A ball',['A bat','A helmet','A racket']],['Which sport uses a racket and a yellow ball?','Tennis',['Swimming','Boxing','Cycling']],['What do swimmers swim in?','Water',['Sand','Grass','Snow']],['Which sport uses a bicycle?','Cycling',['Cricket','Rugby','Golf']],['What colour card sends a footballer off?','Red',['Blue','Green','White']],
      ['How many goals are at each end of a football pitch?','1',['2','3','4']],['Which sport uses a bat and wickets?','Cricket',['Tennis','Hockey','Basketball']],['What do runners race around?','A track',['A swimming pool','A boxing ring','A golf hole']],['Which sport is played at Wimbledon?','Tennis',['Football','Rugby','Cricket']],['What do you try to score in football?','Goals',['Runs','Tries','Baskets']],
      ['Which sport uses a hoop and a bouncing ball?','Basketball',['Golf','Swimming','Cycling']],['What do cyclists wear to protect their heads?','Helmets',['Gloves only','Scarves','Slippers']],['Which sport is played on ice with a puck?','Ice hockey',['Tennis','Cricket','Netball']],['How many rings are on the Olympic symbol?','5',['3','4','6']],['Which race is the shortest?','100 metres',['A marathon','5,000 metres','10,000 metres']],
      ['What does a goalkeeper try to stop?','The ball',['The whistle','The crowd','The clock']],['Which sport has a scrum?','Rugby',['Golf','Tennis','Swimming']],['What is used to hit a golf ball?','A club',['A racket','A paddle','A glove']],['Which sport has cars racing around a track?','Motor racing',['Netball','Badminton','Darts']],['What do you wear on your feet to play football?','Boots',['Flippers','Skates','Slippers']],
      ['Which sport uses a shuttlecock?','Badminton',['Football','Rugby','Golf']],['What do boxers wear on their hands?','Gloves',['Boots','Flippers','Skates']],['Which sport uses a net and seven players on each team?','Netball',['Golf','Cycling','Boxing']],['What must a racing driver cross to finish the race?','The finish line',['The goal line','The touchline','The baseline']],['Which sport is played with a cue and coloured balls on a table?','Snooker',['Cricket','Hockey','Tennis']]
    ],
    'Film, TV & Games':[
      ['What colour is Lightning McQueen?','Red',['Blue','Green','Purple']],['What kind of animal is Bluey?','Dog',['Cat','Bear','Rabbit']],['Who is Elsa’s sister?','Anna',['Moana','Belle','Ariel']],['Which character is a yellow sponge?','SpongeBob',['Mario','Sonic','Simba']],['Which game character wears a red cap?','Mario',['Sonic','Pikachu','Link']],
      ['Which blue character runs very fast?','Sonic',['Luigi','Kirby','Yoshi']],['Who is the cowboy in Toy Story?','Woody',['Buzz Lightyear','Rex','Hamm']],['What kind of fish is Nemo?','Clownfish',['Shark','Tuna','Goldfish']],['Who is Simba’s dad?','Mufasa',['Scar','Timon','Pumbaa']],['Which Pokémon is yellow?','Pikachu',['Squirtle','Bulbasaur','Charmander']],
      ['What is the snowman in Frozen called?','Olaf',['Sven','Kristoff','Hans']],['Who is Mario’s brother?','Luigi',['Sonic','Toad','Bowser']],['Which hero can climb walls like a spider?','Spider-Man',['Batman','Hulk','Thor']],['Which princess has very long magical hair?','Rapunzel',['Jasmine','Tiana','Mulan']],['Which game is made from blocks and has Creepers?','Minecraft',['Fortnite','Mario Kart','FIFA']],
      ['Which toy thinks he is a space ranger?','Buzz Lightyear',['Woody','Rex','Slinky Dog']],['Who is the demigod in Moana?','Maui',['Simba','Aladdin','Olaf']],['Which film has a talking red racing car?','Cars',['Frozen','Toy Story','Moana']],['Which superhero uses a shield with a star?','Captain America',['Hulk','Batman','Thor']],['Which dinosaur film is set in a theme park?','Jurassic Park',['Finding Nemo','Encanto','Cars']],
      ['Which princess has a tiger called Rajah?','Jasmine',['Elsa','Moana','Merida']],['What school does Harry Potter go to?','Hogwarts',['Nevermore','Monsters University','Jedi Academy']],['Which hero is also called Bruce Wayne?','Batman',['Spider-Man','Iron Man','Hulk']],['Which game has a Battle Bus and a Storm?','Fortnite',['Minecraft','Mario Kart','Tetris']],['Which film family has superpowers and wears red suits?','The Incredibles',['The Madrigals','The Simpsons','The Flintstones']]
    ],
    'UK & Everyday':[
      ['What colour are most UK post boxes?','Red',['Blue','Green','Yellow']],['Which side of the road do people drive on in the UK?','Left',['Right','Middle','Either']],['What number calls the UK emergency services?','999',['111','123','555']],['What colour traffic light means stop?','Red',['Green','Blue','White']],['What colour traffic light means go when it is safe?','Green',['Red','Purple','Black']],
      ['What do you put on a letter before posting it?','A stamp',['A key','A coin','A button']],['Which appliance keeps food cold?','A fridge',['An oven','A toaster','A kettle']],['Which appliance boils water?','A kettle',['A freezer','A vacuum','A washing machine']],['What should you do before crossing a road?','Look and listen',['Close your eyes','Run straight out','Face backwards']],['Which city is the capital of England?','London',['Cardiff','Edinburgh','Belfast']],
      ['What currency is used in the UK?','Pound sterling',['Euro','Dollar','Yen']],['How many pence make one pound?','100',['10','50','1,000']],['What do black and white road stripes mark?','A zebra crossing',['A motorway','A car park','A roundabout']],['Which city is famous for the Beatles?','Liverpool',['Oxford','Bath','Coventry']],['Which city has the Bullring shopping centre?','Birmingham',['York','Plymouth','Norwich']],
      ['Which city has famous cathedral ruins and a phoenix symbol?','Coventry',['Leeds','Exeter','Brighton']],['What do you use to measure a fever?','A thermometer',['A ruler','A compass','A clock']],['Which bin should a clean cardboard box usually go in?','Recycling bin',['Food-waste bin','Laundry basket','Toolbox']],['What colours are on the Union Flag?','Red, white and blue',['Green and yellow','Black and orange','Pink and purple']],['What does NHS 111 help with?','Urgent medical help that is not a 999 emergency',['Ordering food','Booking a holiday','Paying road tax']],
      ['What should you wear in a car?','A seat belt',['A swimming hat','Slippers','A scarf only']],['What does a green pedestrian light mean?','It is safe to cross if traffic has stopped',['Run without looking','Cars must speed up','The road is closed']],['Which service delivers letters to UK homes?','Royal Mail',['The BBC','National Rail','The NHS']],['What does a library let you borrow?','Books',['Cars','Houses','Traffic lights']],['What do you use to pay for shopping?','Money or a payment card',['A ruler','A pillow','A toothbrush']]
    ]
  };
  Object.entries(young).forEach(([category,items])=>items.forEach((item,i)=>addRated(category,i%2?6:5,item[0],item[1],item[2],0,'young')));

  const variety={
    'Science & Space':[
      [9,'Which state of matter keeps its own shape?','A solid',['A liquid','A gas','A shadow']],[9,'What is the change from liquid water to water vapour called?','Evaporation',['Freezing','Melting','Condensation']],[9,'Which part of a circuit provides electrical energy?','A battery',['A switch','A wire','A bulb only']],[9,'Which of these is a renewable energy source?','Wind',['Coal','Oil','Natural gas']],[9,'What causes day and night on Earth?','Earth rotating',['The Moon switching off','Clouds moving','The Sun orbiting Earth daily']],
      [10,'How many planets are in our Solar System?','8',['7','9','10']],[10,'Which force slows moving objects when surfaces rub?','Friction',['Gravity','Magnetism','Buoyancy']],[10,'What do we call an animal with a backbone?','Vertebrate',['Invertebrate','Microbe','Mineral']],[10,'Which body system breaks food down?','Digestive system',['Nervous system','Skeletal system','Respiratory system']],[10,'Sound is produced by what kind of movement?','Vibrations',['Freezing','Melting','Shadows']],
      [11,'What is the change from water vapour to liquid water called?','Condensation',['Evaporation','Sublimation','Freezing']],[11,'Which material is a good electrical conductor?','Copper',['Rubber','Plastic','Dry wood']],[11,'What is the path of a planet around a star called?','An orbit',['An axis','A crater','A shadow']],[11,'What do we call an organism that is eaten by another animal?','Prey',['Predator','Producer','Decomposer']],[11,'Which organ takes oxygen from the air into the body?','Lungs',['Liver','Kidneys','Stomach']],
      [12,'Which simple machine is a sloping surface?','An inclined plane',['A pulley','A lever','A wheel and axle']],[12,'What is the main source of energy for most food chains?','The Sun',['The Moon','Soil','Wind only']],[12,'Which type of microorganism is used to make bread rise?','Yeast',['Virus','Algae','Protozoan']],[12,'What is a mixture called when one substance dissolves in another?','A solution',['An element','A crystal','A vacuum']],[12,'Which layer of Earth is broken into moving tectonic plates?','The crust',['The inner core','The outer core','The mantle only']],
      [11,'What gas do plants take in from the air?','Carbon dioxide',['Oxygen','Helium','Hydrogen']],[11,'What is the centre of an atom called?','Nucleus',['Cell','Orbit','Crystal']],[11,'What is the largest organ of the human body?','Skin',['Heart','Liver','Brain']],[12,'Which blood cells help fight infection?','White blood cells',['Red blood cells','Platelets only','Nerve cells']],[12,'Which process lets plants make food using light?','Photosynthesis',['Respiration','Digestion','Evaporation']],
      [12,'What is the name of our galaxy?','The Milky Way',['Andromeda','Orion','Centaurus']],[13,'What unit is used to measure electrical current?','Ampere',['Volt','Watt','Ohm']],[13,'Which particle has a negative electric charge?','Electron',['Proton','Neutron','Photon']],[14,'A substance with pH 7 is described as what?','Neutral',['Acidic','Alkaline','Radioactive']],[14,'Which vitamin can the body make when skin is exposed to sunlight?','Vitamin D',['Vitamin A','Vitamin B12','Vitamin C']],
      [15,'How many pairs of chromosomes do most human cells contain?','23',['22','24','46']],[15,'What is the SI unit of force?','Newton',['Joule','Watt','Pascal']],[16,'What structure carries genetic instructions in cells?','DNA',['ATP','pH','RNA only']],[16,'Which planet has the moons Phobos and Deimos?','Mars',['Venus','Jupiter','Mercury']],[17,'What are the tiny air sacs in the lungs called?','Alveoli',['Nephrons','Villi','Axons']],
      [17,'What type of energy is stored in food?','Chemical energy',['Sound energy','Nuclear energy','Light only']],[18,'Approximately how fast does light travel in a vacuum?','300,000 km/s',['30,000 km/s','3,000 km/s','3,000,000 km/s']],[18,'Which cell structure is often called the powerhouse of the cell?','Mitochondrion',['Nucleus','Ribosome','Cell wall']],[18,'What does a light-year measure?','Distance',['Time','Brightness','Mass']],[18,'Which gas is the largest contributor to human-caused global warming?','Carbon dioxide',['Oxygen','Argon','Neon']]
    ],
    'Geography':[
      [8,'How many continents are there?','7',['5','6','8']],[8,'Which continent is the largest?','Asia',['Europe','Africa','Australia']],[8,'Which ocean lies between Europe and North America?','Atlantic Ocean',['Pacific Ocean','Indian Ocean','Southern Ocean']],[8,'What does a compass show?','Directions',['Temperature','Time','Rainfall']],[8,'Which direction is halfway between north and east?','North-east',['South-west','North-west','South-east']],
      [9,'Which is the smallest continent by land area?','Australia',['Asia','Africa','Europe']],[9,'Which continent is the South Pole on?','Antarctica',['Europe','Asia','Africa']],[9,'What do contour lines on a map show?','Height and slope',['Road speed','Population only','Time zones']],[9,'What is a piece of land almost surrounded by water called?','A peninsula',['An island','A valley','A plateau']],[9,'What is the mouth of a river?','Where it enters a sea, lake or another river',['Where it begins','Its deepest point','A bridge across it']],
      [10,'Which is the longest river in the United Kingdom?','River Severn',['River Thames','River Trent','River Mersey']],[10,'What is the highest mountain in the United Kingdom?','Ben Nevis',['Snowdon','Scafell Pike','Slieve Donard']],[10,'Which country shares England’s northern land border?','Scotland',['Wales','France','Ireland']],[10,'What is the name for the place where a river begins?','Its source',['Its mouth','Its delta','Its bank only']],[10,'Which climate is hot and wet throughout most of the year?','Tropical rainforest',['Polar','Desert','Tundra']],
      [11,'Lines of latitude run mainly in which direction?','East to west',['North to south','Up and down','In circles around the poles only']],[11,'Lines of longitude meet at which two points?','The North and South Poles',['The Equator and Greenwich','The tropics','The date line only']],[11,'What is molten rock called after it reaches Earth’s surface?','Lava',['Magma','Granite','Ash']],[11,'What does population mean?','The number of people living in a place',['The height of a place','The amount of rain','The age of a country']],[11,'What is an urban area?','A town or city area',['Open countryside','An ocean region','A polar ice sheet']],
      [11,'Which is the largest ocean?','Pacific Ocean',['Atlantic Ocean','Indian Ocean','Arctic Ocean']],[11,'Which continent contains the Sahara Desert?','Africa',['Asia','Europe','South America']],[11,'Which imaginary line divides Earth into northern and southern halves?','The Equator',['The Prime Meridian','The Tropic of Cancer','The Date Line']],[12,'Which mountain range runs along western South America?','The Andes',['The Alps','The Himalayas','The Rockies']],[12,'Which sea lies between southern Europe and northern Africa?','Mediterranean Sea',['Baltic Sea','Caribbean Sea','Arabian Sea']],
      [12,'Which canal links the Mediterranean Sea to the Red Sea?','Suez Canal',['Panama Canal','Kiel Canal','Corinth Canal']],[13,'Which is the largest country by land area?','Russia',['Canada','China','United States']],[13,'Mount Everest lies on the border of Nepal and which country?','China',['India','Pakistan','Bhutan']],[14,'Which river flows through Paris?','The Seine',['The Rhine','The Danube','The Thames']],[14,'Which desert covers much of northern Africa?','Sahara',['Gobi','Atacama','Kalahari']],
      [15,'Which mountain range is often used as part of the boundary between Europe and Asia?','Ural Mountains',['Pyrenees','Apennines','Atlas Mountains']],[15,'Which river flows into the Black Sea after passing through several European capitals?','Danube',['Loire','Shannon','Po']],[16,'Which strait separates southern England from northern France?','Strait of Dover',['Strait of Gibraltar','Bering Strait','Bosporus']],[16,'Which line of longitude passes through Greenwich?','Prime Meridian',['Equator','International Date Line','Tropic of Capricorn']],[17,'Which lake is the deepest freshwater lake in the world?','Lake Baikal',['Lake Superior','Lake Victoria','Lake Geneva']],
      [17,'Which three countries share the island of Borneo?','Indonesia, Malaysia and Brunei',['India, Nepal and Bhutan','Spain, France and Portugal','Chile, Peru and Bolivia']],[18,'Iceland lies on the boundary between which two tectonic plates?','North American and Eurasian',['African and Arabian','Pacific and Antarctic','Nazca and South American']],[18,'The Amazon basin is mainly on which continent?','South America',['Africa','Asia','North America']],[18,'Which country contains the region of Transylvania?','Romania',['Hungary','Bulgaria','Serbia']],[18,'Which capital city stands on the River Vltava?','Prague',['Vienna','Warsaw','Budapest']]
    ],
    'Animals':[
      [13,'Which mammal is capable of true sustained flight?','Bat',['Flying squirrel','Sugar glider','Penguin']],[14,'What is the largest species of shark?','Whale shark',['Great white shark','Tiger shark','Hammerhead shark']],[14,'Which animal has fingerprints extremely similar to humans?','Koala',['Giraffe','Dolphin','Penguin']],[15,'What is a group of lions called?','A pride',['A herd','A pack','A school']],[15,'Which bird has the largest wingspan of any living bird?','Wandering albatross',['Golden eagle','Emperor penguin','Ostrich']],
      [16,'Which class of animal includes frogs and salamanders?','Amphibians',['Reptiles','Mammals','Arachnids']],[16,'What is the largest living reptile?','Saltwater crocodile',['Komodo dragon','Green anaconda','Leatherback turtle']],[17,'Which part of a blue whale can weigh as much as a small car?','Its heart',['Its eye','Its tongue tip','Its fin only']],[18,'What is the only continent without native ants?','Antarctica',['Europe','Australia','South America']],[18,'Which animal has the highest blood pressure?','Giraffe',['Elephant','Blue whale','Cheetah']]
    ]
  };
  Object.entries(variety).forEach(([category,items])=>items.forEach(item=>addRated(category,item[0],item[1],item[2],item[3],0,'variety')));

  const slots=new Map();
  questions.forEach(card=>{const slot=slots.get(card.category)||0;card.slot=slot;slots.set(card.category,slot+1);});
  function ageDistance(item,age){
    const outside=age<item.minAge?item.minAge-age:age>item.maxAge?age-item.maxAge:0;
    return outside*20+Math.abs(item.targetAge-Math.min(age,18))*2+item.priority;
  }
  function resolve(card,rawAge){
    const age=clampAge(rawAge),pool=bank.filter(item=>item.category===card.category).sort((a,b)=>ageDistance(a,age)-ageDistance(b,age)||a.id.localeCompare(b.id));
    if(!pool.length)return card.standard;
    const close=pool.filter(item=>ageDistance(item,age)<=ageDistance(pool[0],age)+8);
    const required=Math.min(pool.length,slots.get(card.category)||20);
    const candidates=close.length>=required?close:pool.slice(0,required);
    return candidates[Number(card.slot||0)%candidates.length];
  }

  const topics=[...new Set(questions.map(q=>q.category))];
  window.SPENCER_LIVE_QUIZ={
    id:'family-mega-quiz-v2',
    name:'Family Mega Quiz',
    description:bank.length+' age-rated questions across '+topics.length+' topics.',
    topics,
    questions,
    bank,
    resolve,
    clampAge
  };
})();
