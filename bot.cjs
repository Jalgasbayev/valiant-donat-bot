const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const TOKEN = "8714180608:AAFiKwNkGxVF3h1REnhSwXMEbOWARDIginA";
const ADMIN_ID = 8568826078;

const CHANNEL_USERNAME = "@Valiant_Akkount_Savdo";

const bot = new TelegramBot(TOKEN, {
    polling: true
});


let users = {};
let userData = {};
let orders = {};


// ================= USERS JSON =================

if(fs.existsSync("users.json")){

    users = JSON.parse(
        fs.readFileSync("users.json","utf8")
    );

}


function saveUsers(){

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users,null,4)
    );

}



// ================= OBUNA =================


async function checkSub(id){

    try{

        const member = await bot.getChatMember(
            CHANNEL_USERNAME,
            id
        );


        return (
            member.status !== "left" &&
            member.status !== "kicked"
        );


    }catch(err){

        return false;

    }

}



// ================= MENULAR =================


const menu = {

    reply_markup:{
        keyboard:[
            ["💎 Donat olish"],
            ["📞 Admin"]
        ],
        resize_keyboard:true
    }

};



const donatMenu = {

    reply_markup:{
        keyboard:[
            ["💎105 Almaz"],
            ["💎341 Almaz"],
            ["💎572 Almaz"],
            ["💳 Kunlik"],
            ["💳 Haftalik"],
            ["💳 Oylik"],
            ["🏠 Bosh menyu"]
        ],
        resize_keyboard:true
    }

};



const confirmMenu = {

    reply_markup:{
        keyboard:[
            ["✅ Tasdiqlash"],
            ["❌ Orqaga"]
        ],
        resize_keyboard:true
    }

};



const subscribeMenu = {

    reply_markup:{
        inline_keyboard:[

            [
                {
                    text:"📢 Kanalga obuna bo'lish",
                    url:"https://t.me/Valiant_Akkount_Savdo"
                }
            ],

            [
                {
                    text:"✅ Obunani tekshirish",
                    callback_data:"check_sub"
                }
            ]

        ]
    }

};



// ================= PAKETLAR =================


const packages = {

    "💎105 Almaz":"13 000 so'm",
    "💎341 Almaz":"36 999 so'm",
    "💎572 Almaz":"59 999 so'm",
    "💳 Kunlik":"8 999 so'm",
    "💳 Haftalik":"24 999 so'm",
    "💳 Oylik":"85 999 so'm"

};



// ================= START =================


bot.onText(/\/start/, async(msg)=>{


    const id = msg.from.id;


    users[id]={

        name:msg.from.first_name,
        username:msg.from.username || "",
        id:id

    };


    saveUsers();



    const ok = await checkSub(id);



    if(!ok){

        bot.sendMessage(
            id,
            "❌ Botdan foydalanish uchun avval kanalga obuna bo'ling.",
            subscribeMenu
        );

        return;

    }



    userData[id]={
        step:null
    };



    bot.sendMessage(
        id,
        "🎮 Free Fire Donat Bot\n\nXush kelibsiz!",
        menu
    );


});



// ================= OBUNA TEKSHIRISH =================


bot.on("callback_query", async(query)=>{


    if(query.data==="check_sub"){


        const ok = await checkSub(
            query.from.id
        );


        if(ok){


            userData[query.from.id]={
                step:null
            };


            bot.sendMessage(
                query.from.id,
                "✅ Obuna tasdiqlandi!",
                menu
            );


        }else{


            bot.answerCallbackQuery(
                query.id,
                {
                    text:"❌ Hali obuna bo'lmagansiz",
                    show_alert:true
                }
            );


        }

    }


});
// ================= ADMIN BUYRUQLARI =================


bot.onText(/\/stats/, (msg)=>{


    if(msg.from.id !== ADMIN_ID) return;


    bot.sendMessage(
        msg.chat.id,
        `📊 Bot statistikasi

👥 Jami foydalanuvchilar: ${Object.keys(users).length} ta`
    );


});





bot.onText(/\/users/, (msg)=>{


    if(msg.from.id !== ADMIN_ID){

        bot.sendMessage(
            msg.chat.id,
            "❌ Sizda ruxsat yo'q"
        );

        return;
    }



    let text = "👥 Foydalanuvchilar:\n\n";


    for(let id in users){


        text += 
`👤 ${users[id].name}
🆔 ${users[id].id}

`;

    }



    bot.sendMessage(
        msg.chat.id,
        text || "Foydalanuvchi yo'q"
    );


});




// ================= ASOSIY XABARLAR =================


bot.on("message", async(msg)=>{


    const id = msg.chat.id;
    const text = msg.text || "";



    // commandlarni o'tkazib yuborish

    if(text.startsWith("/")) return;



    if(!userData[id]){

        userData[id]={
            step:null
        };

    }



    const data = userData[id];





    // DONAT OLISH


    if(text==="💎 Donat olish"){


        bot.sendMessage(
            id,
            "Kerakli paketni tanlang:",
            donatMenu
        );


        return;

    }





    // BOSH MENYU


    if(text==="🏠 Bosh menyu"){


        bot.sendMessage(
            id,
            "🏠 Bosh menyu",
            menu
        );


        return;

    }





    // ADMIN


    if(text==="📞 Admin"){


        bot.sendMessage(
            id,
            "@ValiantElite"
        );


        return;

    }





    // PAKET TANLASH


    if(packages[text]){


        data.package=text;
        data.price=packages[text];


        data.step="confirm";



        bot.sendMessage(
            id,
`📦 ${text}
💰 ${packages[text]}

Buyurtmani tasdiqlaysizmi?`,
            confirmMenu
        );


        return;

    }





    // ORQAGA


    if(text==="❌ Orqaga"){


        bot.sendMessage(
            id,
            "Kerakli paketni tanlang:",
            donatMenu
        );


        return;

    }





    // TASDIQLASH


    if(text==="✅ Tasdiqlash"){


        data.step="id";


        bot.sendMessage(
            id,
`💳 To'lov ma'lumotlari:

KARTA RAQAMI: 5440810376933023 ✔
👤 A/J

To'lov qilgach Free Fire ID yuboring:`
        );


        return;

    }





    // FREE FIRE ID


    if(data.step==="id"){


        data.game_id=text;

        data.step="nick";


        bot.sendMessage(
            id,
            "👤 Nick yuboring:"
        );


        return;

    }





    // NICK


    if(data.step==="nick"){


        data.nick=text;

        data.step="receipt";



        bot.sendMessage(
            id,
            "📸 Endi chek rasmini yuboring:"
        );


        return;

    }





    // CHEK RASMI


    if(data.step==="receipt"){


        if(!msg.photo){


            bot.sendMessage(
                id,
                "❌ Iltimos chek rasmini yuboring."
            );


            return;

        }



        const caption =
`🆕 YANGI BUYURTMA

📦 Paket: ${data.package}
💰 Narx: ${data.price}

🆔 ID: ${data.game_id}
👤 Nick: ${data.nick}

👤 Username: @${msg.from.username || "yo'q"}
🆔 Telegram ID: ${id}`;



        await bot.sendPhoto(
            ADMIN_ID,
            msg.photo[msg.photo.length-1].file_id,
            {
                caption:caption,
                reply_markup:{
                    inline_keyboard:[
                        [
                            {
                                text:"✅ Qabul qilish",
                                callback_data:"accept_"+id
                            },
                            {
                                text:"❌ Rad etish",
                                callback_data:"reject_"+id
                            }
                        ]
                    ]
                }
            }
        );



        bot.sendMessage(
            id,
            "✅ Buyurtmangiz qabul qilindi!\n\n⏳ Admin ko'rib chiqadi.",
            menu
        );



        userData[id]={
            step:null
        };


        return;

    }


});
// ================= ADMIN QARORI =================


bot.on("callback_query", async(query)=>{


    const data = query.data;



    // QABUL QILISH

    if(data.startsWith("accept_")){


        const userId = data.split("_")[1];


        bot.sendMessage(
            userId,
`✅ Buyurtmangiz qabul qilindi!

💎 Tez orada donatingiz tushiriladi.`
        );



        bot.answerCallbackQuery(
            query.id,
            {
                text:"Buyurtma qabul qilindi"
            }
        );



        return;

    }





    // RAD ETISH


    if(data.startsWith("reject_")){


        const userId = data.split("_")[1];


        bot.sendMessage(
            userId,
`❌ Buyurtmangiz rad etildi.

📞 Admin bilan bog'laning:
@ValiantElite`
        );



        bot.answerCallbackQuery(
            query.id,
            {
                text:"Buyurtma rad etildi"
            }
        );



        return;

    }



});




// ================= XATOLAR =================


bot.on("polling_error",(error)=>{

    console.log(
        "Polling error:",
        error.message
    );

});




// ================= ISHGA TUSHIRISH =================


console.log("✅ Bot ishga tushdi...");