import userData from '../mockData/user.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let users = [...userData]

const userService = {
  async getAll() {
    await delay(300)
    return [...users]
  },

  async getById(id) {
    await delay(200)
    const user = users.find(user => user.id === id)
    return user ? { ...user } : null
  },

  async create(userData) {
    await delay(400)
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      preferences: userData.preferences || {}
    }
    users.push(newUser)
    return { ...newUser }
  },

  async update(id, userData) {
    await delay(300)
    const index = users.findIndex(user => user.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }
    users[index] = { ...users[index], ...userData }
    return { ...users[index] }
  },

  async delete(id) {
    await delay(250)
    const index = users.findIndex(user => user.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }
    users.splice(index, 1)
    return true
  }
}

export default userService