const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  // 1. Criar Categorias
  await prisma.category.createMany({
    data: [
      { name: 'Hardware / Equipamentos' },
      { name: 'Software / Sistema' },
      { name: 'Rede / Internet' },
      { name: 'Impressoras' },
      { name: 'Outros' },
    ],
    skipDuplicates: true,
  })

  // 2. Criar Lojas
  await prisma.store.createMany({
    data: [
      { code: '001', name: 'Loja Matriz' },
      { code: '002', name: 'Loja Baturite' },
      { code: '003', name: 'Loja Barreira' },
      { code: '004', name: 'Loja Aracoiaba' },
    ],
    skipDuplicates: true,
  })

  // 3. Criar Usuários de Teste (AGORA COM USERNAME)
  const password = await bcrypt.hash("123", 10) // Senha padrão

  // TI - Carlos (Matriz)
  await prisma.user.upsert({
    where: { username: 'carlos.ti' }, // <--- Busca pelo username
    update: {
      store: { connect: { code: '001' } }
    },
    create: {
      username: 'carlos.ti', // <--- Cria com username
      name: 'Carlos (TI)',
      password: password,
      role: 'ADMIN',
      department: 'Tecnologia',
      store: { connect: { code: '001' } } // Vincula à Matriz
    }
  })

  // Caixa - Maria (Matriz)
  await prisma.user.upsert({
    where: { username: 'maria.caixa' },
    update: {
      store: { connect: { code: '001' } }
    },
    create: {
      username: 'maria.caixa',
      name: 'Maria (Frente)',
      password: password,
      role: 'USER',
      department: 'Frente de loja',
      store: { connect: { code: '001' } }
    }
  })

  // Açougue - João (Vamos colocar na Filial Baturite para testar relatório)
  await prisma.user.upsert({
    where: { username: 'joao.acougue' },
    update: {
      store: { connect: { code: '002' } }
    },
    create: {
      username: 'joao.acougue',
      name: 'João (Açougueiro)',
      password: password,
      role: 'USER',
      department: 'Açougue',
      store: { connect: { code: '002' } } // Vincula à Baturite
    }
  })

  console.log('Banco populado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })