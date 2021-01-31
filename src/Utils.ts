import jwt from "jsonwebtoken";

export class Utils {
    static replaceBadWords = (message: string) => {
        // I really wish there was a better way than having to list all of these.
        const badWords = /\b(anal|ass|asses|ballsack|boner|clit|clitoris|cum|cunt|cunts|dicks|fag|fags|homo|homos|jiz|tit|twat|wang)\b|\b(cock|sex)|asshole|bastard|bitch|biatch|blowjob|boob|bollock|bollok|butthole|dickhead|damn|dildo|duche|dyke|ejaculate|faggot|fellatio|fuck|masterbat|nigger|nigga|nutsack|orgasm|pecker|penis|pimp|piss|pussy|pussies|schlong|screw|shit|slut|testicle|tits|titt|viagra|vulva|wanker|whore/gi;
        return message.replace(badWords, '****');
    }

    public static isHost = (token: string, room: string) => {
        const churchId = parseInt((room.replace("church_", "").split("_")[0]), 0);
        if (churchId === 0) return false;
        else {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const authChurchId = decoded.churchId;
            return (churchId === authChurchId);
        }
    }
}