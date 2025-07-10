import jwt from 'jsonwebtoken';
import { AUTH_TOKEN_SECRET } from '../config.js';

function getAuthToken(payload) { 
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            
            AUTH_TOKEN_SECRET,
            
            { expiresIn: "1d" },

            (e, token) => { 
                if (e)
                    reject(e);
                
                resolve(token);
            }
        )
    });
}

export async function handleTokenCreation(username, type, res) {
    const payload = { username: username, type: type };

    await getAuthToken(payload)
    .then((token) => {
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json(payload);
    })
    .catch((e) => {
        res.status(503).json({message: "Session token creation went wrong..."});
        console.log(`Exception handling token creation: ${e}`);
    });
}

export async function handleEmptyTokenCreation(res) {
    res.cookie('token', '', { expires: new Date(0) });
    res.status(200).json({message: "Logged out..."});
}

