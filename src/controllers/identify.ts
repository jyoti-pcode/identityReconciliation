import { Request, Response } from 'express';
import { STATUS_CODES } from '@enums/statusCodes';
import { sendResponse } from '@models/response'
import { Contact } from '@entity/contact'
import { getManager, In, getRepository } from 'typeorm';


exports.post = async (req: Request, res: Response) => {
    try {

        const { email, phoneNumber }: { email: string, phoneNumber: string } = req.body;

        let userEntity = getManager()
        let userRepository = getRepository(Contact)

        let responseObject: Object = {}
        let primaryContacts = []
        let secondaryContact = []
        let primaryId: Number

        let contacts: any = await Promise.all([
            userEntity.find(Contact, {
                where: {
                    email: email
                }
            }),
            userEntity.find(Contact, {
                where: {
                    phoneNumber: phoneNumber
                }
            })
        ])

        contacts = contacts.flat()

        //if no primary contacts create and push and update
        if (contacts.length == 0) {
            //create a new primaryContact
            let newPrimaryContact = new Contact()
            newPrimaryContact.email = email
            newPrimaryContact.phoneNumber = phoneNumber
            newPrimaryContact.linkPrecedence = 'primary'
            newPrimaryContact.createdAt = new Date()
            newPrimaryContact.updatedAt = new Date()
            await userEntity.save(Contact, newPrimaryContact)
            primaryContacts.push(newPrimaryContact)
            contacts.push(newPrimaryContact)
        } else {
            for (let i = 0; i < contacts.length; i++) {
                let user = contacts[i]
                if (user.linkPrecedence == 'primary' && user.id != primaryId) {
                    primaryContacts.push(user)
                }
                primaryId = user.linkedId
            }
        }

        if (!primaryContacts.length && !!primaryId) {
            primaryContacts = await userEntity.find(Contact, {
                where: {
                    id: primaryId
                }
            })
        }

        //check if more than 2 primaryContacts ,then change the oldest one to the new primaryContact
        if (primaryContacts.length > 1) {
            //check the one with oldest creation date remains the primaryContact
            primaryContacts = primaryContacts.sort((a, b) => a.createdAt - b.createdAt)
            primaryId = primaryContacts[0].id
            //get other secondary Contacts
            let otherSecondaryContacts = await userEntity.find(Contact, {
                where: {
                    linkedId: primaryId
                }
            })
            secondaryContact = primaryContacts.slice(1)
            secondaryContact = [...otherSecondaryContacts, ...secondaryContact]
            let secondaryIds = secondaryContact.map(user => user.id)
            //updateAllotherContacts as secondary
            await userEntity.createQueryBuilder().update(Contact).set({ linkedId: primaryId, linkPrecedence: 'secondary' }).where({ id: In(secondaryIds) }).execute()
        } else {
            //check if not the case of primary Contact else just find the secondary contacts
            if (primaryContacts[0].email != email || primaryContacts[0].phoneNumber != phoneNumber) {
                //find if it a new secondaryContact
                let whereClause = {
                    linkPrecedence: 'secondary',
                }
                if (!!email && !!phoneNumber) {
                    whereClause['email'] = email
                    whereClause['phoneNumber'] = phoneNumber
                } else if (!email && !!phoneNumber) {
                    whereClause['phoneNumber'] = phoneNumber
                } else if (!!email && !phoneNumber) {
                    whereClause['email'] = email
                }
                let newSecondaryContact: any = await userEntity.find(Contact, {
                    where: whereClause
                })

                if (!newSecondaryContact.length) {
                    newSecondaryContact = new Contact()
                    newSecondaryContact.email = email
                    newSecondaryContact.phoneNumber = phoneNumber
                    newSecondaryContact.linkPrecedence = 'secondary'
                    newSecondaryContact.createdAt = new Date()
                    newSecondaryContact.linkedId = primaryId
                    newSecondaryContact.updatedAt = new Date()
                    await userEntity.save(Contact, newSecondaryContact)
                }
            }


            secondaryContact = await userEntity.find(Contact, {
                where: {
                    linkedId: primaryId
                }
            })
        }

        responseObject = {
            contact: {
                primaryContatctId: primaryContacts[0].id,
                emails: [...new Set([primaryContacts[0].email, ...secondaryContact.map(user => user.email)])],
                phoneNumbers: [...new Set([primaryContacts[0].phoneNumber, ...secondaryContact.map(user => user.phoneNumber)])],
                secondaryContactIds: [...secondaryContact.map(user => user.id)]
            }
        }

        //check if it is a secondary contact basis of email/phone


        sendResponse(res, responseObject, STATUS_CODES.SUCCESS, true)

    } catch (err) {
        return sendResponse(res, { msg: err.message }, STATUS_CODES.SERVER_ERROR, false);
    }
}