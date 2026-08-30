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

  const topics=[...new Set(questions.map(q=>q.category))];
  window.SPENCER_LIVE_QUIZ={
    id:'family-mega-quiz',
    name:'Family Mega Quiz',
    description:questions.length+' family-adaptive question cards across '+topics.length+' topics.',
    topics,
    questions
  };
})();
