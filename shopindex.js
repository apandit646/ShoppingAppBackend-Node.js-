const express = require('express');
const mongoose = require('mongoose');
const cluster = require('cluster');
const os = require('os');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { totalmem, type } = require('os');
const { compileFunction } = require('vm');
const { stringify } = require('querystring');
const app = express();
const totalCPUs=os.cpus().length;
if(cluster.isPrimary) {
    for(let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    
    }
}else {
    const app = express();
    const pORT = 8000;

}

app.use(express.urlencoded({ extends: false }))
app.use(express.json())

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(String('your-secret-key')).digest('base64').substr(0, 32);
const iv = crypto.createHash('sha256').update(String('your-fixed-iv')).digest('base64').substr(0, 16);


function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
// Function to decrypt data
function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

mongoose.connect('mongodb://localhost:27017/shoppingAPP')
    .then(() => console.log('Welcome to shopping app'))
    .catch((err) => console.log('Mongo Error', err))



const userschema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },

    firstname: {
        type: String,
    },

    lastname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        set: encrypt, // Encrypt the password before saving
        get: decrypt  // Decrypt the password when retrieving
    },
    password: {
        type: String,
        required: true,
        set: encrypt, // Encrypt the password before saving
        get: decrypt  // Decrypt the password when retrieving
    },
    admin: {
        type: String,
    }
});
const shoppingCart = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    product: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    pricePrProduct: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    }
})
const productselect = new mongoose.Schema({ // purchahse data schema 
    id:{
        type: String,
        required: true,
    },
    orderid:{
        type: String,
        required: true,
    },
    products: {},
    total: {
        type: Number,
        default: 0
    }

})
const purchaseCart = new mongoose.Schema({ // Cart data 
    id: {
        type: String,

    },
    products: {},


})


const User = mongoose.model("user", userschema)
const Cart = mongoose.model("cart", shoppingCart)
const PurchaseCart = mongoose.model("purchasecart", purchaseCart)
const SelectedproductList = mongoose.model("productList", productselect)
userschema.set('toObject', { getters: true })
userschema.set('toJSON', { getters: true })

//genering sring number for id 
function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
async function prizeUdate(params) {


    let findId = await PurchaseCart.findOne({ id: params })

    if (!findId) {
        return res.json(findId, "No purchase cart found")
    }
    productId = findId.products



    for (var i = 0; i < productId.length; i++) {
        const result = await Cart.findOne({ id: productId[i].id })
        console.log("result", result)
        if (!result) {
            return res.json(result, "No product found in cart")
        }
        const filter = { id: params, "products.id": result.id }
        const updateDoc = {
            $set: { 'products.$.pricePrProduct': result.pricePrProduct }
        };
        await PurchaseCart.updateOne(filter, updateDoc);
    }
    return 1
}
app.post('/signup', async (req, res) => {
    const body = req.body;
    if (!body.firstname || !body.lastname || !body.email || !body.password) {
        return res.status(401).json({ meg: " all fields ae required" });
    }
    femail = body.email
    const user = await User.findOne({ email: femail })
    console.log("user dta", user)
    if (user) {
        return res.status(401).json({ meg: "Emailis alreay present" });
    }
    if (!body.admin) {
        fadmin = "false"
    } else {
        fadmin = body.admin
    }
    // with use of mongoose data base 
    const reult = await User.create({
        id: randomString(8),
        firstname: body.firstname,
        lastname: body.lastname,
        email: femail,
        password: body.password,
        admin: fadmin,
    });
    console.log(reult, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    return res.status(201).json({
        status: "singup account successfully created",
    })
});
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (token == null) {
        return res.sendStatus(401); // Unauthorized if no token is provided
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid
        }
        req.user = user; // Attach user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
};



app.post('/admine', authenticateToken, async (req, res) => {
    const check_Admine = req.user.user.admin
    const body = req.body;
    if (check_Admine != "true") {
        return res.status(401).json({ meg: "You are not admine" });
    }

    if (!body.product || !body.quantity || !body.pricePrProduct) {
        return res.status(401).json({ meg: " All Product Field are Required " });
    }
    const checkCart = await Cart.findOne({ product: body.product })
    Cart.find
    if (!checkCart) {
        const reult = await Cart.create({
            id: randomString(8),
            product: body.product,
            quantity: body.quantity,
            pricePrProduct: body.pricePrProduct,
            totalPrice: Number(body.quantity) * Number(body.pricePrProduct),
        });
        console.log(reult, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        return res.status(201).json({
            status: "singup account successfully created",
        })
    }

    check_Cart = await Cart.findOneAndUpdate({ product: body.product }, {
        quantity: Number(body.quantity) + Number(checkCart.quantity),
        pricePrProduct: body.pricePrProduct,
        totalPrice: (Number(body.quantity) + Number(checkCart.quantity)) * Number(body.pricePrProduct)
    },)

    return res.json({ status: "Stock Updated", checkCart })
});

app.get('/admine/cardData/', authenticateToken, async (req, res) => { // checking you are admine userdata
    const userData = req.user.user

    if (userData.admin == "true") {
        const allDBusers = await Cart.find({})
        return res.json(allDBusers)
    } else {
        return res.json("you are not admine")
    }
})

app.patch('/admine/card/', authenticateToken, async (req, res) => { //updating the taking of the user
    const check_Admine = req.user.user.admin
    const postedData = req.body;
    if (check_Admine = "false") {
        return res.status(401).json({ meg: "You are not admine" });
    }
    const user = await Profile.findoneAndUpdate({ "id": profileData.id }, {
        $set: {
            "product": postedData.product,
            "quantity": postedData.quantity,
            "pricePrProduct": postedData.pricePrProduct,
            "totalPrice": Number(postedData.quantity) * Number(postedData.pricePrProduct)
        }
    });
    if (!user) {
        return res.status(404).send();
    }
    res.json({
        user
    })
});
app.delete('/admine/delete/', authenticateToken, async (req, res) => {
    const check_Admine = req.user.user.admin
    console.log(check_Admine);
    let postedData = req.body;
    console.log(postedData, "<<<<<<<<<<<<<<<<<<<<<<<<<")
    if (check_Admine == "false") {
        return res.status(401).json({ meg: "You are not admine" });
    }
    const result = await Cart.findOneAndDelete({ id: postedData.id });
    console.log(result);
    // TODO  remove this when we remove the profile  data
    return res.json({ status: "success" });
});
//\/\\/\/\/\/\/\//\//\/\/\//\/\/\/\//\/\/\/\//\/\/\/\\/\//\ /\  /\/ \/\ \   \   \   \ \ \
app.post('/login', async (req, res) => {
    const body = req.body;
    if (!body.email || !body.password) {
        return res.status(401).json({ meg: " incomplite data" });

    }
    femail = body.email
    fpassword = body.password
    let user = await User.findOne({ email: femail, password: fpassword })
    if (!user) {
        return res.status(401).json({ meg: " user not found" });
    }
    user = JSON.parse(JSON.stringify(user))
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<", user)
    delete user.password //delete password we dont want to display the data 
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", user)
    jwt.sign({ user }, secretKey, { expiresIn: '3000s' }, (err, token) => {  // generating token autentica
        res.json({
            token,
            user
        })
    })
})
app.get(('/login/list'), authenticateToken, async (req, res) => {
    const userData = req.user.user
    const all_cartData = await Cart.find({})
    console.log(all_cartData, "<<<<<<<<<<<<<<<<<<<<<<<<")
    const filtered_cartData = all_cartData.filter((cartData) => cartData.quantity > 0)// performing filtering operations on cart data
    res.json(filtered_cartData)
})
app.post(('/login/list/purchase'), authenticateToken, async (req, res) => {
    const userData = req.user.user.id
    const body = req.body
    console.log(body), "<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    listProduct = await body.product.split(',')
    listquantity = await body.quantity.split(',').map(function (item) {
        return parseInt(item, 10);
    });
    console.log(listquantity, "<<<<<<<<")
    total = 0
    all_quantity = []
    buy_quanitity = []
    all_prize = []

    product_list = []
    for (let i = 0; i < listProduct.length; i++) {
        try {
            result = await Cart.findOne({ product: listProduct[i] })
            console.log(result.product)
            console.log(result.quantity)
            if (result.product != null) {

                if (result.quantity >= listquantity[i]) {
                    product_list.push(result.product)
                    all_quantity.push(result.quantity)
                    all_prize.push(result.pricePrProduct)

                    buy_quanitity.push(listquantity[i])
                }

            }

        } catch (error) {
            console.error(`stock is not available`);
        }
    }

    if (product_list.length == 0) {
        return res.status(404).json({ meg: " product not found in cart" });
    }
    const first = all_quantity.map((num, index) => num * all_prize[index]);

    fianlresult = first.reduce((a, b) => a + b, 0)


    const invoice = await SelectedproductList.create({
        id: userData,
        product: product_list,
        quantity: buy_quanitity,
        pricePrProduct: all_prize,
        totalPrice: fianlresult,
        products: {
            id: userData,
            product: product_list,
            quantity: buy_quanitity,
            pricePrProduct: all_prize,
            totalPrice: fianlresult,

        }
    });
    console.log(product_list, "<<<<<<<<<<<<<<<<<<<<<<")
    for (let i = 0; i < product_list.length; i++) {
        const result = await Cart.findOneAndUpdate({ product: product_list[i] }, { quantity: all_quantity[i] - buy_quanitity[i] });
        console.log(result);
    }
    return res.json(invoice);
})
// cart data 
app.post(('/login/list/cart'), authenticateToken, async (req, res) => {
    const userData = req.user.user.id
    const body = req.body
    let cartData = []
    let buyData = []
    let qty = []
    let prize = []
    findId = await PurchaseCart.findOne({ id: userData })
    // console.log('findId', findId)

    if (!findId) {
        for (let i = 0; i < body.length; i++) {
            try {
                result = await Cart.findOne({ product: body[i].product })
                if (result.product != null) {

                    if (result.quantity >= body[i].quantity) {
                        cartData.push(result)
                        qty.push(body[i].quantity),
                            prize.push(result.pricePrProduct),

                            buyData.push({
                                id: result.id,
                                product: body[i].product,
                                quantity: body[i].quantity,
                                pricePrProduct: result.pricePrProduct,

                            })
                    }
                } else {
                    return res.json(result.product, "Outoff stock");
                }

            } catch (error) {
                console.error(`stock is not available`)
            }
        }

        const cart = await PurchaseCart.create({
            id: userData,
            products: buyData,

        })

    } else {
        const findId_products = findId.products
        for (let i = 0; i < body.length; i++) {
            try {
                result = await Cart.findOne({ product: body[i].product })
                if (result.product != null) {
                    data_Not_present = await PurchaseCart.findOne({ id: userData, "products.id": result.id })

                    if (data_Not_present) {



                        for (let i = 0; i < findId_products.length; i++) {
                            if (findId_products[i].id == result.id) {

                                if (result.quantity >= body[i].quantity + findId_products[i].quantity) {
                                    const filter = { id: userData, "products.id": result.id }
                                    const updateDoc = {
                                        $set: { 'products.$.quantity': (body[i].quantity + findId_products[i].quantity) }
                                    };
                                    await PurchaseCart.updateOne(filter, updateDoc);


                                }

                            }
                        }

                    } else {
                        if (result.quantity >= body[i].quantity) {
                            const filter = { id: userData, products: { $not: { $elemMatch: { id: result.id } } } }
                            const updateDoc = { $push: { products: { id: result.id, product: body[i].product, quantity: body[i].quantity, pricePrProduct: result.pricePrProduct } } }
                            await PurchaseCart.updateOne(filter, updateDoc);
                        }

                    }



                } else {
                    return res.json(result.product, "Outoff stock");
                }

            } catch (error) {
                console.error(`stock is not available`)
            }


        }

    }
    hello = await prizeUdate(userData)

    res.json("secressfull")
})
// buy data 
app.post(('/login/list/purchas'), authenticateToken, async (req, res) => {
    const userData = req.user.user.id
    qty = []
    prize = []
    cartData = []
    pricePrProducts = []
    final_result=[]
    await prizeUdate(userData)
    const findId = await PurchaseCart.findOne({ id: userData })
    if (!findId) {
        return res.json("cart is empty")
    }
    const findId_products = findId.products 

    for (let i = 0; i < findId_products.length; i++) {
        result = await Cart.findOne({ product: findId_products[i].product })

        if(result){
            if(result.quantity >=findId_products[i].quantity){
                console.log(result.quantity, findId_products[i].quantity)
                console.log("result.quantity")
                qty.push(findId_products[i].quantity),
                prize.push(findId_products[i].pricePrProduct)
                cartData.push(result.quantity)
                pricePrProducts.push(result.pricePrProduct)
                final_result.push(findId_products)

            }
           
            
        }
        
    }
   
    const fresult = qty.map((num, index) => num * prize[index]);
    fianlresult = fresult.reduce((a, b) => a + b, 0)
    const invoice = await SelectedproductList.create({
        id: userData,
        orderid:randomString(8),
        products:final_result,
        total: fianlresult
    })
    res.json(invoice)
    for (let i = 0; i < final_result.length; i++) {
        const result = await Cart.findOneAndUpdate({ product: final_result[i].product }, { quantity: cartData[i] - qty[i] },{totalPrice:pricePrProducts[i] - (final_result[i].quantity *final_result[i].pricePrProduct)});
        
    }

})
app.listen(pORT, () => console.log("server started"));