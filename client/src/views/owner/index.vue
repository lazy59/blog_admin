<template>
    <content-card>
        <div class="content" v-if="userinfo&&userinfo.name">
            <div class="avatar-box">
                <el-upload
                    class="avatar-uploader"
                    action="/api/user/avatar"
                    :headers="{Authorization: getToken()}"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :on-error="handleAvatarError"
                    :before-upload="beforeAvatarUpload">
                    <div class="avatar" :style="{backgroundImage: avatarUrl}"></div>
                </el-upload>
            </div>
            <div class="info-box">
                <p class="name">你好，<span>{{userinfo.name}}</span>
                    <el-tooltip class="item" effect="dark" content="点击修改个人信息" placement="top">
                        <i class="el-icon-edit" @click="showEdit"></i>
                    </el-tooltip>
                </p>
                <p class="role">你拥有“{{role}}”权限，请开始你的操作！</p>
            </div>
        </div>
        <el-dialog title="修改个人信息" width="15rem" :visible.sync="isEditting">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" :maxlength="15" :show-word-limit="true" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" show-password :maxlength="32" :show-word-limit="true" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="isEditting = false">取 消</el-button>
                <el-button type="primary" @click="saveUser">确 定</el-button>
            </div>
        </el-dialog>
    </content-card>
</template>

<script>
import ContentCard from '@/components/ContentCard/index'
import JSencrypt from 'jsencrypt'

export default {
    name: 'usersetting',
    data() {
        return {
            isEditting: false,
            form: {
                name: '',
                password: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 1, max: 15, message: '用户名称范围[1-15]', trigger: 'blur' }
                ]
            }
        }
    },
    components: {
        ContentCard
    },
    created() {
        this.$store.dispatch('users/getuserinfo')
    },
    computed: {
        userinfo() {
            return this.$store.state.users.userinfo
        },
        role() {
            return ['编辑员','管理员'][this.userinfo.role-1]
        },
        avatarUrl() {
            return 'url(' + (this.userinfo.avatar || '/avatar/default.jpg') + ')'
        },
        publicKey() {
            return this.$store.state.users.publicKey
        }
    },
    methods: {
        getToken() {
            return "Bearer " + window.localStorage.getItem("author_token")
        },
        showEdit() {
            this.isEditting = true
            this.form.name = this.userinfo.name
        },
        async saveUser() {
            this.$refs.form.validate( async valid => {
                if(valid) {
                    try {
                        await this.$store.dispatch('users/getKey')
                        let password = ''
                        if(this.form.password) {
                            let encrypt = new JSencrypt()
                            encrypt.setPublicKey(this.publicKey)
                            password =encrypt.encrypt(this.form.password)
                        }
                        let res = await this.$http.post('user/edit', {...this.form, password, _id: this.userinfo._id})
                        if(res.errcode === 0) {
                            this.$store.dispatch('users/getuserinfo')
                            this.$message({
                                type: 'success',
                                message: '修改成功！'
                            })
                        } else {
                             this.$message.error('修改失败！');
                        }
                    }catch(err) {
                        this.$message.error('修改失败！');
                    }
                    this.isEditting = false
                } else {
                    return false
                }
            })
        },
        handleAvatarSuccess(res) {
            if(res.errcode === 0) {
                this.$store.dispatch('users/getuserinfo')
                this.$message({
                    type: 'success',
                    message: '修改成功！'
                })
            } else {
                this.handleAvatarError()
            }
        },
        handleAvatarError() {
            this.$message.error('头像上传失败！');
        },
        beforeAvatarUpload(file) {
            // TODO 压缩图片
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt1M = file.size / 1024 / 1024 < 1;

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG 和 PNG 格式!');
            }
            if (!isLt1M) {
                this.$message.error('上传头像图片大小不能超过 1MB!');
            }
            return isJPG && isLt1M;
        }
    }
}

</script>

<style lang="less" scoped>
@size : 4rem;

.content {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.65rem;
    padding-top: 3rem;
    padding-bottom: 2rem;
    .avatar-box {
        position: relative;
        width: @size;
        height: @size;
        .avatar {
            position: relative;
            width: @size;
            height: @size;
            border-radius: 50%;
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center center;
            // background-color: #ccc;
            &:hover::after {
                content: "点击更换";
                position: absolute;
                top: 0;
                left: 0;
                width: @size;
                height: @size;
                line-height: @size;
                font-size: 0.5rem;
                cursor: pointer;
                border-radius: 50%;
                z-index: 100;
                background-color: rgba(0, 0, 0, .5);
                color: #fff;
                text-align: center;
            }
        }
    }
    .info-box {
        padding-left: 2rem;
        .name {
            font-size: 0.6rem;
            span {
                // color: #409EFF;
            }
            .el-icon-edit {
                color: #409EFF;
                margin-left: 5px;
                cursor: pointer;
            }
        }
    }
}
</style>