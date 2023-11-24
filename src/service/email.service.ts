import nodemailer from 'nodemailer'
import * as keys from '../resource/email-server-config.json'

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: 'noreply@eonhub.net',
        serviceClient: keys.client_id,
        privateKey: keys.private_key,
    },
    from: keys.client_email
})