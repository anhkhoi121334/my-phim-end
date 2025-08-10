const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// 连接到MongoDB
async function createAdmin() {
  // 连接URL - 使用环境变量或默认值
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsdjuifsd';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('已连接到MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // 检查管理员用户是否已存在
    const existingAdmin = await usersCollection.findOne({ email: 'admin@myphim.com' });

    if (existingAdmin) {
      console.log('管理员用户已存在');
      return;
    }

    // 创建密码哈希
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    // 创建管理员用户
    const adminUser = {
      fullName: '管理员',
      email: 'admin@myphim.com',
      passwordHash,
      role: 'admin',
      provider: 'credentials',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 插入到数据库
    const result = await usersCollection.insertOne(adminUser);
    console.log(`创建管理员用户成功，ID: ${result.insertedId}`);

  } catch (error) {
    console.error('创建管理员用户时出错:', error);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行函数
createAdmin().catch(console.error); 