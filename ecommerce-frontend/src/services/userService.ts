import { userApi, type User } from '../api/userApi'

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await userApi.getAll()
    return data
  },

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const { data: updated } = await userApi.updateProfile(id, data)
    return updated
  },

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    await userApi.changePassword(id, { currentPassword, newPassword })
  },
}

export default userService
