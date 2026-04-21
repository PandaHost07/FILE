/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

/** Akun demo — ganti sandi di production atau hapus user ini. */
const DEMO = {
    admin: {
        email: 'admin@restoregen.local',
        password: 'AdminRestoreGen2026!',
        name: 'Admin (uji)',
        role: 'ADMIN',
    },
    user: {
        email: 'user@restoregen.local',
        password: 'UserRestoreGen2026!',
        name: 'User (uji)',
        role: 'USER',
    },
}

async function main() {
    const rounds = 12

    const adminHash = await bcrypt.hash(DEMO.admin.password, rounds)
    await prisma.user.upsert({
        where: { email: DEMO.admin.email },
        update: {
            passwordHash: adminHash,
            name: DEMO.admin.name,
            role: DEMO.admin.role,
        },
        create: {
            email: DEMO.admin.email,
            passwordHash: adminHash,
            name: DEMO.admin.name,
            role: DEMO.admin.role,
        },
    })

    const userHash = await bcrypt.hash(DEMO.user.password, rounds)
    await prisma.user.upsert({
        where: { email: DEMO.user.email },
        update: {
            passwordHash: userHash,
            name: DEMO.user.name,
            role: DEMO.user.role,
        },
        create: {
            email: DEMO.user.email,
            passwordHash: userHash,
            name: DEMO.user.name,
            role: DEMO.user.role,
        },
    })

    console.log('Seed OK — akun uji coba:')
    console.log('  Admin:', DEMO.admin.email, '/', DEMO.admin.password)
    console.log('  User: ', DEMO.user.email, '/', DEMO.user.password)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => void prisma.$disconnect())
