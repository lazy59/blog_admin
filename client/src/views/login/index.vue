<template>
    <div id="login">
        <el-card class="box-card">
            <el-form :model="form" :rules="rules" ref="loginForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" :maxlength="15" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" show-password :maxlength="32" :show-word-limit="true" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div class="button-container">
                <el-button type="primary" @click="login">登录</el-button>
            </div>
        </el-card>
    </div>
</template>

<script>
import JSencrypt from 'jsencrypt'

export default {
    name: 'login',
    data() {
        return {
            form: {
                name: '',
                password: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 1, max: 15, message: '用户名称范围[1-15]', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入用户密码', trigger: 'blur' },
                    { min: 5, max: 32, message: '用户密码范围[5-32]', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        publicKey() {
            return this.$store.state.users.publicKey
        },
    },
    methods: {
        async login() {
            this.$refs.loginForm.validate( async valid => {
                if(valid) {
                    try {
                        await this.$store.dispatch('users/getKey')
                        let encrypt = new JSencrypt()
                        encrypt.setPublicKey(this.publicKey)
                        const password = encrypt.encrypt(this.form.password)
                        let res = await this.$http.post('user/login', {...this.form, password})
                        if(res.errcode === 0) {
                            window.localStorage.setItem('author_token', res.token)
                            this.$router.push('/')
                        } else {
                             this.$message.error('登录失败！');
                        }
                    }catch(err) {
                        this.$message.error('登录失败！');
                    }
                    this.isPopshow = false
                } else {
                    return false
                }
            })
        }
    }
}

</script>

<style lang="less" scoped>
#login {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #545c64;
    .box-card {
        width: 14rem;
        .header {
            text-align: center;
            font-weight: 100;
        }
        .button-container {
            overflow: hidden;
            > button {
                float: right;
            }
        }
    }
}
</style>