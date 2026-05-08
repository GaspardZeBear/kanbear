import fs from 'fs';
class Konsol {

    static wsClient
    static setClient(wsClient) {
        Konsol.wsClient = wsClient
    }

    static log(...msg) {
        try {
            const ddate = new Date()
            const now = Date.now()
            const ddated = ddate.toISOString()
            let evt = {
                type: 'log',
                date: ddated,
                correlationId: now,
                fields: []
            }
            for (let m of msg) {
                //evt.fields.push(`${JSON.stringify(m).substring(0, 160)} ...`)
                evt.fields.push(m)
                //console.log('Konsol.log() ', evt)
            }
            Konsol.wsClient.send(JSON.stringify(evt))
        } catch (error) {
            console.log("Konsol.log() error <error>", error, "<msg>", msg)
        }
    }
}


export { Konsol };