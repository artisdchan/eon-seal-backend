import fetch from "node-fetch"
import { URLSearchParams } from "url"
import { EONHUB_API_KEY, EONHUB_BACKEND_URL } from "../utils/secret.utils"

export default class EonHubService {

    public isUserExist = async (email: string) => {

        try {
            const queryParam = new URLSearchParams()
            queryParam.set('email', email);
            const response = await fetch(`${EONHUB_BACKEND_URL}/api/user/email?` + queryParam.toString(), {
                method: 'GET',
                headers: {
                    'API-KEY': EONHUB_API_KEY
                }
            });

            if (!response.ok) {
                return false;
            }

            return true;

        } catch (error) {
            console.error(error);
            return false;
        }
    }

}