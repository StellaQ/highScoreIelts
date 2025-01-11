// staticQuestions.js
const staticQuestions = [
    {categoryName: "Personal Information",
    categoryNameInChinese: "个人信息",
    description: "- 介绍自己（例如名字、职业、家乡）- 关于家庭（例如家庭成员、父母的职业）",
    subCategories: [
        {tagName: "Hometown",
        tagId: "t1",
        questions: [
            { qId: "q1", qText: "Do you come from a city, town or village?", type: 0, choices: ['city', 'town', 'village']},
            { qId: "q2", qText: "What do you like about your home city/town/village?", type: 1 },
            { qId: "q3", qText: "Is your home city/town/village a good place for young people?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Where you live",
        tagId: "t2",
        questions: [
            { qId: "q4", qText: "How long have you lived in the house or apartment you’re living in now?", type: 1 },
            { qId: "q5", qText: "What do you like about this house or apartment?", type: 1 },
            { qId: "q6", qText: "What kind of home would you like to live in in the future?", type: 1 },
            { qId: "q7", qText: "What work do you do?", type: 1 }
        ]}
    ]},
    {categoryName: "Daily",
    categoryNameInChinese: "日常生活",
    description: "- 工作或学习（例如工作内容、学习专业、为什么选择这个专业）- 日常活动（例如一天中的典型活动、周末活动）",
    subCategories: [
        {tagName: "Work and Study",
        tagId: "t3",
        questions: [
            { qId: "q8", qText: "How easy is it to get this kind of work in your country?", type: 1 },
            { qId: "q9", qText: "How important is it to you to have work that you enjoy doing?", type: 1 }
        ]},
        {tagName: "Work and Study2",
        tagId: "t4",
        questions: [
            { qId: "q10", qText: "Where do you work?", type: 1 },
            { qId: "q11", qText: "How do you usually travel to work?", type: 1 },
            { qId: "q12", qText: "How do you feel after you finish a day at work?", type: 1 }
        ]},
        {tagName: "Sweet things",
        tagId: "t5",
        questions: [
            { qId: "q13", qText: "Did you enjoy sweet things when you were a child?", type: 0, choices: ['yes', 'no'] },
            { qId: "q14", qText: "Have you ever made a cake yourself?", type: 0, choices: ['yes', 'no'] },
            { qId: "q15", qText: "How often do you eat something sweet after a meal?", type: 1 }
        ]},
        {tagName: "Tea or coffee",
        tagId: "t6",
        questions: [
            { qId: "q16", qText: "Do people like to drink tea and coffee in your country?", type: 0, choices: ['yes', 'no'] },
            { qId: "q17", qText: "Do you ever go out to drink tea or coffee?", type: 0, choices: ['yes', 'no'] },
            { qId: "q18", qText: "Would you offer a visitor to your home tea or coffee?", type: 0, choices: ['tea', 'coffee'] },
            { qId: "q19", qText: "When was the last time you drank tea or coffee?", type: 1 }
        ]},
        {tagName: "Gifts",
        tagId: "t7",
        questions: [
            { qId: "q20", qText: "Have you ever received a really good present?", type: 0, choices: ['yes', 'no'] },
            { qId: "q21", qText: "Are you good at choosing presents for others?", type: 0, choices: ['yes', 'no'] },
            { qId: "q22", qText: "What kind of present would you buy for your friends?", type: 1 },
            { qId: "q23", qText: "Have you ever given someone a present that you made yourself?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Feeling bored",
        tagId: "t8",
        questions: [
            { qId: "q24", qText: "Do you often feel bored?", type: 0, choices: ['yes', 'no'] },
            { qId: "q26", qText: "What sort of things do you find most boring?", type: 1 },
            { qId: "q26", qText: "What do you do to keep yourself from getting bored?", type: 1 },
            { qId: "q27", qText: "Are you bored more easily now than when you were younger?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Memory",
        tagId: "t9",
        questions: [
            { qId: "q28", qText: "What do you need to remember to do every day?", type: 1},
            { qId: "q29", qText: "Have you ever forgotten to do something important?", type: 0, choices: ['yes', 'no'] },
            { qId: "q30", qText: "Is it easy to remember to do things?", type: 0, choices: ['yes', 'no'] },
            { qId: "q31", qText: "What do you do to help you remember to do things?", type: 1}
        ]}
    ]},
    {categoryName: "Hobby",
    categoryNameInChinese: "兴趣爱好",
    description: "- 兴趣和爱好（例如阅读、运动、音乐、电影）- 休闲活动（例如旅游、购物、做饭）",
    subCategories: [
        {tagName: "Singing",
        tagId: "t10",
        questions: [
            { qId: "q32", qText: "Do you love singing songs?", type: 0, choices: ['yes', 'no'] },
            { qId: "q33", qText: "Have you learned to sing any songs when you were a child?", type: 0, choices: ['yes', 'no'] },
            { qId: "q34", qText: "Which singers do you like most?", type: 1 },
            { qId: "q35", qText: "Do people in your country often sing songs?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Music",
        tagId: "t11",
        questions: [
            { qId: "q36", qText: "Do you like music?", type: 0, choices: ['yes', 'no'] },
            { qId: "q37", qText: "What kinds of music do you listen to?", type: 1},
            { qId: "q38", qText: "Is it easy to learn music?", type: 0, choices: ['yes', 'no'] },
            { qId: "q39", qText: "Do you learn music lessons at school?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Music2",
        tagId: "t12",
        questions: [
            { qId: "q40", qText: "Do you know how to play any musical instruments?", type: 0, choices: ['yes', 'no'] },
            { qId: "q41", qText: "Have you learned about music at school?", type: 0, choices: ['yes', 'no'] },
            { qId: "q42", qText: "Do you think all children should have music lessons at school?", type: 0, choices: ['yes', 'no'] },
            { qId: "q43", qText: "Do you think it is easy to learn to play a musical instrument?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Films",
        tagId: "t13",
        questions: [
            { qId: "q44", qText: "What’s your favourite kind of film?", type: 1},
            { qId: "q45", qText: "Did you often go to the cinema when you were young?", type: 0, choices: ['yes', 'no'] },
            { qId: "q46", qText: "Would you like to make a film yourself one day?", type: 0, choices: ['yes', 'no'] },
            { qId: "q47", qText: "Do you think watching films is a good way to spend time with friends?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Video games",
        tagId: "t14",
        questions: [
            { qId: "q48", qText: "Have you ever played a video game in your childhood?", type: 0, choices: ['yes', 'no'] },
            { qId: "q49", qText: "Are you interested in watching other people play video games?", type: 0, choices: ['yes', 'no'] },
            { qId: "q50", qText: "Would you prefer to play a video game on your own?", type: 0, choices: ['yes', 'no'] },
            { qId: "q51", qText: "Do you think some people spend too much time playing video games?", type: 0, choices: ['yes', 'no'] }
        ]}
      ]
    }, 
    {categoryName: "Habit",
    categoryNameInChinese: "习惯与常规",
    description: "- 饮食习惯（例如最喜欢的食物、饮食偏好）- 健康习惯（例如锻炼方式、保持健康的方法）",
    subCategories: [
        {tagName: "Colour",
        tagId: "t15",
        questions: [
            { qId: "q52", qText: "What colours do you like most?", type: 1},
            { qId: "q53", qText: "What colour of a car you would like to buy?", type: 1}
        ]},
        {tagName: "Sunglasses",
        tagId: "t16",
        questions: [
            { qId: "q54", qText: "How often do you wear sunglasses?", type: 1},
            { qId: "q55", qText: "Would you buy sunglasses for your friends or family?", type: 0, choices: ['yes', 'no'] },
            { qId: "q56", qText: "Would you spend lots of money on sunglasses?", type: 0, choices: ['yes', 'no'] },
            { qId: "q57", qText: "Have you ever lost any sunglasses?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Clothes",
        tagId: "t17",
        questions: [
            { qId: "q58", qText: "Do you spend a lot of time deciding what to wear every day?", type: 0, choices: ['yes', 'no'] },
            { qId: "q59", qText: "Do you prefer comfortable clothes or smart clothes?", type: 0, choices: ['yes', 'no'] },
            { qId: "q60", qText: "Were you allowed to choose your own clothes when you were a child?", type: 0, choices: ['yes', 'no'] },
            { qId: "q61", qText: "What do you do with your clothes when you no longer use them?", type: 1},
        ]},
        {tagName: "Chatting",
        tagId: "t18",
        questions: [
            { qId: "q62", qText: "Do you often chat with your friends?", type: 0, choices: ['yes', 'no'] },
            { qId: "q63", qText: "Do you like chatting with your friends face-to-face or on social media?", type: 0, choices: ['face-to-face', 'on social media'] },
            { qId: "q64", qText: "Do you like chatting with a group of friends or chatting with just one friend?", type: 0, choices: ['a group of friends', 'just one friend'] },
            { qId: "q65", qText: "Do you ever have disagreements with your friend when you are chatting?", type: 0, choices: ['yes', 'no'] },
            { qId: "q66", qText: "What kinds of jobs involve talking to groups of people?", type: 1}
        ]},
        {tagName: "Famous people",
        tagId: "t19",
        questions: [
            { qId: "q67", qText: "Do you enjoy receiving news about famous people?", type: 0, choices: ['yes', 'no'] },
            { qId: "q68", qText: "Would you like to be famous in the news?", type: 0, choices: ['yes', 'no'] },
            { qId: "q69", qText: "Do you believe the things you read about famous people?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Running",
        tagId: "t20",
        questions: [
            { qId: "q70", qText: "Did you do much running when you were a child?", type: 0, choices: ['yes', 'no'] },
            { qId: "q71", qText: "What do you think of running as a form of exercise?", type: 1 },
            { qId: "q72", qText: "When was the last time you ran?", type: 1 },
            { qId: "q73", qText: "Are there any good places for running near where you live?", type: 0, choices: ['yes', 'no'] }
        ]}, 
        {tagName: "Money",
        tagId: "t21",
        questions: [
            { qId: "q74", qText: "Do you usually like to spend or save money?", type: 0, choices: ['spend money', 'save money'] },
            { qId: "q75", qText: "How often do you use a credit card to pay for things?", type: 1},
            { qId: "q76", qText: "Will you use cash more often in the future?", type: 0, choices: ['yes', 'no'] },
            { qId: "q77", qText: "What do you think about using apps to pay for things?", type: 1 }
        ]}
    ]},
    {categoryName: "Surroundings",
    categoryNameInChinese: "居住环境",
    description: "- 住的地方（例如城市、家乡、住所）- 社区设施（例如公园、商店、公共交通）",
    subCategories: [
        {tagName: "Advertisement",
        tagId: "t22",
        questions: [
            { qId: "q78", qText: "Do you like to watch adverts on the internet or TV?", type: 0, choices: ['yes', 'no']},
            { qId: "q79", qText: "Do you notice advertising in public places?", type: 0, choices: ['yes', 'no']},
            { qId: "q80", qText: "Is there an advert that you remember well from in childhood?", type: 0, choices: ['yes', 'no']},
            { qId: "q81", qText: "Would you like to work in advertising industry?", type: 0, choices: ['yes', 'no']}
        ]},
        {tagName: "Noise",
        tagId: "t23",
        questions: [
            { qId: "q82", qText: "What loud noise can you hear where you live?", type: 1},
            { qId: "q83", qText: "Would you like to live in a less noisy place?", type: 0, choices: ['yes', 'no']},
            { qId: "q84", qText: "Do you think it's okay for people to make noise in public places?", type: 0, choices: ['yes', 'no']},
            { qId: "q85", qText: "Do you enjoy listening to loud music?", type: 0, choices: ['yes', 'no']}
        ]},
        {tagName: "Crowded places",
        tagId: "t24",
        questions: [
            { qId: "q86", qText: "When was the last time you went to a crowded place?", type: 1 },
            { qId: "q87", qText: "Are there many crowded places where you live?", type: 0, choices: ['yes', 'no'] },
            { qId: "q88", qText: "Would you prefer to have a holiday in a crowded place, or a quiet place?", type: 0, choices: ['a crowded place', 'a quiet place'] },
            { qId: "q89", qText: "Do people in your country often celebrate together?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Geography",
        tagId: "t25",
        questions: [
            { qId: "q90", qText: "Did you like to study geography at school?", type: 0, choices: ['yes', 'no'] },
            { qId: "q91", qText: "Is what you learned in geography very useful to you now?", type: 0, choices: ['yes', 'no'] },
            { qId: "q92", qText: "Would you like to be a geography teacher?", type: 0, choices: ['yes', 'no'] },
            { qId: "q93", qText: "Are you interested in finding out more about the geography of other countries?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Fishing",
        tagId: "t26",
        questions: [
            { qId: "q94", qText: "Is fishing popular in your country?", type: 0, choices: ['yes', 'no'] },
            { qId: "q95", qText: "How do you feel about eating fish?", type: 1},
            { qId: "q96", qText: "Have you ever visited a place where you saw lots of fish?", type: 0, choices: ['yes', 'no'] },
            { qId: "q97", qText: "Would you ever watch a TV programme or film about fish?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Helping others",
        tagId: "t27",
        questions: [
            { qId: "q98", qText: "What kind of help do you give to other people?", type: 1},
            { qId: "q99", qText: "Did your family encourage you to be helpful when you were a child?", type: 0, choices: ['yes', 'no'] },
            { qId: "q100", qText: "Do you like to help people?", type: 0, choices: ['yes', 'no'] },
            { qId: "q101", qText: "When was the last time someone helped you?", type: 1}
        ]}
    ]},
    {categoryName: "future plan",
    categoryNameInChinese: "未来计划",
    description: "- 未来目标（例如职业目标、生活计划）- 学习计划（例如继续学习的打算、学习新技能）",
    subCategories: [
        {tagName: "Stages in life",
        tagId: "t28",
        questions: [
            { qId: "q102", qText: "What did you enjoy most about your childhood?", type: 1 },
            { qId: "q103", qText: "What’s the best thing about being the age you are now?", type: 1 },
            { qId: "q104", qText: "What do you want to do five years later?", type: 1 },
            { qId: "q105", qText: "How can people remember all the different stages in their lives?", type: 1 }
        ]}
    ]},
    {categoryName: "celeberate",
    categoryNameInChinese: "节日与庆祝",
    description: "- 传统节日（例如如何庆祝新年、最喜欢的节日）- 特别活动（例如生日、婚礼）",
    subCategories: [
    ]},
    {categoryName: "Culture",
    categoryNameInChinese: "文化与社会",
    description: "- 文化习俗（例如家乡的文化、传统习俗）- 社会现象（例如环境保护、志愿者活动）",
    subCategories: [
        {tagName: "Social media",
        tagId: "t29",
        questions: [
            { qId: "q106", qText: "Do your friends and family use social media?", type: 0, choices: ['yes', 'no'] },
            { qId: "q107", qText: "Do you think people in your country find social media useful?", type: 0, choices: ['yes', 'no'] },
            { qId: "q108", qText: "Do you spend too much time on social media?", type: 0, choices: ['yes', 'no'] },
            { qId: "q109", qText: "When did you start using social media?", type: 1}
        ]}
    ]},
    {categoryName: "Technology",
    categoryNameInChinese: "技术与媒体",
    description: "- 技术使用（例如常用的电子设备、对科技的看法）- 媒体消费（例如喜欢的电视节目、电影）",
    subCategories: [
        {tagName: "Robots",
        tagId: "t30",
        questions: [
            { qId: "q110", qText: "How interested are you in robots?", type: 1},
            { qId: "q111", qText: "When you were a child, did you enjoy robot films?", type: 0, choices: ['yes', 'no'] },
            { qId: "q112", qText: "Would you like to have a robot to help you at home?", type: 0, choices: ['yes', 'no'] },
            { qId: "q113", qText: "Would you feel happy travelling in car with automatic driving?", type: 0, choices: ['yes', 'no'] }
        ]},
        {tagName: "Maps",
        tagId: "t31",
        questions: [
            { qId: "q114", qText: "Do you often use a map on your phone? How often?", type: 0, choices: ['yes', 'no'] },
            { qId: "q115", qText: "Have you ever used a paper map?", type: 0, choices: ['yes', 'no'] },
            { qId: "q116", qText: "Would you ever put a map on the wall in your home when you were a child?", type: 0, choices: ['yes', 'no'] },
            { qId: "q117", qText: "Do you find it easy to read maps?", type: 0, choices: ['yes', 'no'] }
        ]}
    ]},
    {categoryName: "Travel",
    categoryNameInChinese: "旅游与出行",
    description: "- 旅行经验（例如去过的地方、难忘的旅行经历）- 出行方式（例如喜欢的交通工具、日常通勤）",
    subCategories: [
    ]}
];
module.exports = staticQuestions;