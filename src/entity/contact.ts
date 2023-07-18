import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { BaseEntity } from './baseEntity';

@Entity("Contact", { schema: "public" })
export class Contact extends BaseEntity {

    @PrimaryGeneratedColumn({
        type: 'integer',
        name: "id"
    })
    id!: number;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255,
        name: "email"
    })
    email!: String;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255,
        name: "phoneNumber"
    })
    phoneNumber!: String;

    @Column({
        type: 'integer',
        nullable: true,
        name: "linkedId"
    })
    linkedId!: Number;

    @Column({
        type: 'varchar',
        nullable: false,
        length: 255,
        name: "linkPrecedence"
    })
    linkPrecedence!: String;
}