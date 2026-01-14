import logger from "./logger";

interface STKPushRequest {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
}

interface STKPushResponse {
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    ResponseCode?: string;
    ResponseDescriptio?: string;
    CustomerMessage?: string;
    errorMessage?: string
}

export class MpesaService {
    private consumerKey: string;
    private consumerSecret: string;
    private passkey: string;
    private shortcode: string;
    private callbackUrl: string;
    private baseUrl: string;
    private till: string;
    private useMpesaLow?: boolean

    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
        this.passkey = process.env.MPESA_PASSKEY || '';
        this.shortcode = process.env.MPESA_SHORTCODE || '';
        this.till = process.env.MPESA_TILL || '';
        this.callbackUrl = process.env.PUBLIC_APP_URL + "/api/payments/mpesa/callback" || '';
        this.baseUrl = 'https://api.safaricom.co.ke'
        this.useMpesaLow = JSON.parse(process.env.USE_MPESA_LOW_AMT || "")

    }

    // Generate OAuth token
    async getAccessToken(): Promise<string> {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
            console.log('url::::', this.baseUrl)
            const response = await fetch(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`
                    }
                }
            );
            const res = await response.json();
            console.log("res token:::", res.access_token);
            return res.access_token;
        } catch (error) {
            if (error instanceof Error)
                logger.error('M-Pesa access token error: ' + error.message)
            console.error('M-Pesa access token error:', error);
            throw new Error('Failed to get M-Pesa access token');
        }
    }

    // Generate password for STK push
    private generatePassword(): string {
        const timestamp = this.getTimestamp();
        const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
        return password;
    }

    // Get timestamp in format YYYYMMDDHHmmss
    private getTimestamp(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    private generateOriginatorConversationID() {
        const random = Math.random().toString(36).substring(2, 14);
        return `${this.shortcode}_Payout_${random}`;
    }
    // Format phone number to 254XXXXXXXXX
    private formatPhoneNumber(phone: string): string {
        let formatted = phone.replace(/\s+/g, '');

        if (formatted.startsWith('0')) {
            formatted = '254' + formatted.substring(1);
        } else if (formatted.startsWith('+')) {
            formatted = formatted.substring(1);
        } else if (!formatted.startsWith('254')) {
            formatted = '254' + formatted;
        }

        return formatted;
    }

    // Initiate STK Push
    async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = this.getTimestamp();
            const password = this.generatePassword();
            // const password = "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjEwNjI4MDkyNDA4"
            const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

            const payload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerBuyGoodsOnline',
                Amount: this.useMpesaLow ? 1 : Math.round(request.amount),
                PartyA: phoneNumber,
                PartyB: this.till,
                PhoneNumber: phoneNumber,
                CallBackURL: this.callbackUrl,
                AccountReference: request.accountReference,
                TransactionDesc: request.transactionDesc
            };
            console.log('payload', payload)
            const response = await fetch(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),

                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }

                }

            );
            const data = await response.json()
            console.log('data', data)
            return data;
        } catch (error) {
            if (error instanceof Error)
                logger.error('initiate M-Pesa payment ' + error.message)
            throw new Error('Failed to initiate M-Pesa payment');
        }
    }

    // Query STK Push status
    async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = this.getTimestamp();
            const password = this.generatePassword();

            const payload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };

            const response = await fetch(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                {
                    body: JSON.stringify(payload),
                    method: 'POST',

                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json()
            logger.info('data:: ', JSON.stringify(data))
            return data;
        } catch (error) {
            if (error instanceof Error)
                logger.error('STK Push query error: ' + error.message)

            throw new Error('Failed to query payment status');
        }
    }

    // B2C (Business to Customer) - Provider Payouts
    async initiateB2C(phoneNumber: string, amount: number, remarks: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const payload = {
                OriginatorConversationID: this.generateOriginatorConversationID(),
                InitiatorName: process.env.MPESA_INITIATOR_NAME,
                SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
                CommandID: 'BusinessPayment',
                // Amount: Math.round(amount),
                Amount: 1,
                PartyA: this.shortcode,
                // PartyB: formattedPhone,
                PartyB: '254700263761',
                Remarks: remarks,
                QueueTimeOutURL: `${process.env.PUBLIC_APP_URL}/payments/mpesa/b2c/callback`,
                ResultURL: `${process.env.PUBLIC_APP_URL}/payments/mpesa/b2c/callback`,
                Occasion: remarks
            };
            
            const response = await fetch(
                `${this.baseUrl}/mpesa/b2c/v3/paymentrequest`,
                {
                    body: JSON.stringify(payload),
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json()
            console.log("payload::", payload)
            console.log("payout::", data)
            return data;
        } catch (error) {
            if (error instanceof Error)
                logger.error('B2C error: ' + error.message)

            throw new Error('Failed to initiate payout');
        }
    }
}