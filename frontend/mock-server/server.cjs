/*
 * API REST fake para desenvolvimento do front-end.
 *
 * Simula o comportamento esperado do backend:
 *  - POST /auth/login e POST /auth/register devolvem { token, usuario }
 *  - todas as outras rotas exigem "Authorization: Bearer <token>"
 *  - o usuário é identificado pelo token, então cada um só enxerga os próprios dados
 *
 * Os dados ficam em db.json (copiado de db.seed.json na primeira execução).
 */
const fs = require('fs')
const path = require('path')
const jsonServer = require('json-server')

const PORT = process.env.PORT || 3001
const DB_FILE = path.join(__dirname, 'db.json')
const SEED_FILE = path.join(__dirname, 'db.seed.json')

if (!fs.existsSync(DB_FILE) || process.argv.includes('--reset')) {
  fs.copyFileSync(SEED_FILE, DB_FILE)
}

const server = jsonServer.create()
const router = jsonServer.router(DB_FILE)
const db = router.db

const RECURSOS = ['transacoes', 'contas', 'metas', 'orcamentos']

const gerarToken = (usuario) => Buffer.from(`monely:${usuario.id}`).toString('base64')

const lerToken = (req) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ')
  if (tipo !== 'Bearer' || !token) return null
  const [prefixo, id] = Buffer.from(token, 'base64').toString().split(':')
  if (prefixo !== 'monely') return null
  return db.get('usuarios').find({ id: Number(id) }).value() || null
}

// eslint-disable-next-line no-unused-vars
const semSenha = ({ senha, ...usuario }) => usuario

server.use(jsonServer.defaults({ logger: true }))
server.use(jsonServer.bodyParser)

// Pequeno atraso para o front exibir os estados de carregamento
server.use((req, res, next) => setTimeout(next, 300))

server.post('/auth/login', (req, res) => {
  const { email, senha } = req.body || {}
  const usuario = db.get('usuarios').find({ email: String(email || '').toLowerCase() }).value()
  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' })
  }
  res.json({ token: gerarToken(usuario), usuario: semSenha(usuario) })
})

server.post('/auth/register', (req, res) => {
  const { nome, email, senha } = req.body || {}
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' })
  }
  const emailNormalizado = String(email).toLowerCase()
  if (db.get('usuarios').find({ email: emailNormalizado }).value()) {
    return res.status(409).json({ message: 'Já existe uma conta com este e-mail.' })
  }
  const id = (db.get('usuarios').maxBy('id').value()?.id || 0) + 1
  const usuario = { id, nome, email: emailNormalizado, senha }
  db.get('usuarios').push(usuario).write()
  res.status(201).json({ token: gerarToken(usuario), usuario: semSenha(usuario) })
})

// Daqui para baixo, tudo exige autenticação
server.use((req, res, next) => {
  const usuario = lerToken(req)
  if (!usuario) return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' })
  req.usuario = usuario
  next()
})

server.get('/usuarios/me', (req, res) => res.json(semSenha(req.usuario)))

server.put('/usuarios/me', (req, res) => {
  const { nome, email, senhaAtual, novaSenha } = req.body || {}
  const alteracoes = {}
  if (nome) alteracoes.nome = nome
  if (email) {
    const emailNormalizado = String(email).toLowerCase()
    const outro = db.get('usuarios').find({ email: emailNormalizado }).value()
    if (outro && outro.id !== req.usuario.id) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' })
    }
    alteracoes.email = emailNormalizado
  }
  if (novaSenha) {
    if (senhaAtual !== req.usuario.senha) {
      return res.status(400).json({ message: 'Senha atual incorreta.' })
    }
    alteracoes.senha = novaSenha
  }
  const atualizado = db.get('usuarios').find({ id: req.usuario.id }).assign(alteracoes).write()
  res.json(semSenha(atualizado))
})

server.delete('/usuarios/me', (req, res) => {
  const usuarioId = req.usuario.id
  RECURSOS.forEach((recurso) => db.get(recurso).remove({ usuarioId }).write())
  db.get('usuarios').remove({ id: usuarioId }).write()
  res.status(204).end()
})

// Bloqueia acesso direto à lista de usuários
server.use('/usuarios', (req, res) => res.status(403).json({ message: 'Acesso negado.' }))

// Amarra cada recurso ao usuário do token
server.use((req, res, next) => {
  const [, recurso, id] = req.path.split('/')
  if (!RECURSOS.includes(recurso)) return next()

  const usuarioId = req.usuario.id
  if (id) {
    const item = db.get(recurso).find({ id: Number(id) }).value()
    if (!item || item.usuarioId !== usuarioId) {
      return res.status(404).json({ message: 'Registro não encontrado.' })
    }
  }
  if (req.method === 'GET') req.query.usuarioId = String(usuarioId)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) req.body.usuarioId = usuarioId
  next()
})

// Ao remover uma conta, remove também as transações dela
server.delete('/contas/:id', (req, res, next) => {
  db.get('transacoes').remove({ contaId: Number(req.params.id) }).write()
  next()
})

server.use(router)

server.listen(PORT, () => {
  console.log(`API fake do Monely rodando em http://localhost:${PORT}`)
  console.log('Login de teste: vitor@fiap.com.br / 123456')
})
