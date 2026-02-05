import User from '../datasource/userDatasource';

class UserService {
  static async getAllUsers() {
    return User.find();
  }

  static async getUserById(id: string) {
    return User.findById(id);
  }

  static async createUser(data: { name: string; email: string }) {
    const user = new User(data);
    return user.save();
  }

  static async updateUser(id: string, data: { name?: string; email?: string }) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteUser(id: string) {
    return User.findByIdAndDelete(id);
  }
}

export default UserService;
