const nodeMailer = require('nodemailer')
const mongo = require('../mongoDB/client')


async function prueba (req, res){ 
    try {
        let psw = await mongo.recovery(req.body.correo);        
        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'mxitinerario@gmail.com',
                pass: 'Asdfg-12345'
            }
        });
    
        let mailOptions = {
            from: '"ItinerarioMX"',
            to: req.body.correo,
            subject: 'Recovery', 
            html: `<h1><b>Itinerario MX. Support team:</b></h1><br><br> Your password is: ${psw[0].psw}`
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            res.status(200).json({ok:true , msg: 'Email has been sent'});
        });
        
    } catch (error) {
        switch (error) {
            case 'NotAuthorized':
                res.status(401).json({ok:false , msg: 'NotAuthorized'});
                break;
            default:
                res.status(500).json({ok:false , msg: 'Server unavailable'});
                break;
        }
    } 
    
}

module.exports = prueba;