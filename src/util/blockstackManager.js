import {  
    getFile,
    putFile,
    lookupProfile,
    Person
} from 'blockstack'

const calendarsInfoFileName = "calendarInfo.json"
const schedulesFileName = "schedules.json"

export default class BlockstackManager {

    static getUserProfile (username) {
        return new Promise(function (resolve, reject) {
            lookupProfile(username).then((profile) => 
            {
                if (profile) {
                    var person = new Person(profile);
                    resolve({ username: username, name: person.name(), avatarUrl: person.avatarUrl() });
                } else {
                    resolve(null);
                }
            }).catch((err) => reject(err));
        })
    }

    static getSchedules () {
        return BlockstackManager._get(schedulesFileName);
    }

    static setSchedules (schedules) {
        return BlockstackManager._save(schedulesFileName, schedules);
    }

    static getCalendarsInfo () {
        return BlockstackManager._get(calendarsInfoFileName);
    }

    static setCalendarsInfo (calendarsInfo) {
        return BlockstackManager._save(calendarsInfoFileName, calendarsInfo);
    }

    static _save (fileName, data) {
        return new Promise(function (resolve, reject) {
            putFile(fileName, JSON.stringify(data)).then(() => resolve()).catch((err) => reject(err));
        });
    }

    static _get (fileName) {
        return new Promise(function (resolve, reject) {
            getFile(fileName).then((file) => 
            {
                if (file) {
                    resolve(JSON.parse(file));
                } else {
                    resolve([]);
                }
            }).catch((err) => reject(err));
        });
    }
}
