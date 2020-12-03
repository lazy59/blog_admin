<template>
    <content-card button="新增用户" @buttonClick="showAddPop">
        <el-table
        :data="renderUsers"
        style="width: 100%">
            <el-table-column
                prop="name"
                label="用户名"
                >
            </el-table-column>
            <el-table-column
                prop="role"
                label="权限"
                >
            </el-table-column>
            <el-table-column
                label="操作"
                >
                <template slot-scope="scope">
                    <el-button
                    size="mini"
                    @click="handleEdit(scope.$index)">编辑</el-button>
                    <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.$index)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :title="popTitle" width="15rem" :visible.sync="isPopshow">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="名称" prop="name" :label-width="formLabelWidth">
                    <el-input v-model="form.name" :maxlength="15" :show-word-limit="true" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" :label-width="formLabelWidth">
                    <el-input v-model="form.password" show-password :maxlength="32" :show-word-limit="true" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="权限" prop="role" :label-width="formLabelWidth">
                    <el-select v-model="form.role" placeholder="选择对应权限">
                        <el-option label="admin" :value="2"></el-option>
                        <el-option label="editor" :value="1"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="isPopshow = false">取 消</el-button>
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
    components: {
        ContentCard
    },
    data() {
        return {
            popTitle: '新增用户',
            isPopshow: false,
            formLabelWidth: '60px',
            editId: '',
            form: {
                name: '',
                password: '',
                role: ''
            },
            
        }
    },
    mounted() {
        this.$store.dispatch('users/getusers')
    },
    computed: {
        usersList() {
            return this.$store.state.users.usersList
        },
        renderUsers() {
            return this.usersList.map( item => {
                let data = {...item}
                data.role = ['editor', 'admin'][data.role-1]
                return data
            })
        },
        publicKey() {
            return this.$store.state.users.publicKey
        },
        rules() {
            let rules = {
                name: [
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 1, max: 15, message: '用户名称范围[1-15]', trigger: 'blur' }
                ],
                role:  [
                    { required: true, message: '请选择用户权限', trigger: 'blur' }
                ]
            }
            if(!this.editId)
            rules.password = [
                { required: true, message: '请输入用户密码', trigger: 'blur' },
                { min: 5, max: 32, message: '用户密码范围[5-32]', trigger: 'blur' }
            ]
            return rules
        }
    },
    methods: {
        showAddPop() {
            this.editId = ''
            this.form.name = this.form.password = this.form.role = ''
            this.popTitle = '新增用户'
            this.isPopshow = true
            this.resetForm()
        },
        async saveUser() {
            this.$refs.form.validate( async valid => {
                if(valid) {
                    try {
                        await this.$store.dispatch('users/getKey')
                        let encrypt = new JSencrypt()
                        encrypt.setPublicKey(this.publicKey)
                        let res
                        const password = this.form.password ? encrypt.encrypt(this.form.password) : ''
                        if(!this.editId) {
                            console.log({...this.form, password})
                            res = await this.$http.post('user/add', {...this.form, password, role: +this.form.role})
                        } else {
                            console.log(this.form)
                            res = await this.$http.post('user/edit', {...this.form, password, role: +this.form.role, _id: this.editId})
                        }
                        if(res.errcode === 0) {
                            this.$store.dispatch('users/getusers')
                            this.$message({
                                type: 'success',
                                message: '保存成功！'
                            })
                        } else {
                             this.$message.error('保存失败！');
                        }
                    }catch(err) {
                        this.$message.error('保存失败！');
                    }
                    this.isPopshow = false
                } else {
                    return false
                }
            })
        },
        handleEdit(index) {
            this.editId = this.usersList[index]['_id']
            this.form.name = this.usersList[index]['name']
            this.form.role = this.usersList[index]['role']
            console.log(this.form)
            this.popTitle = '编辑用户'
            this.isPopshow = true
            // this.resetForm()
        },
        async handleDelete(index) {
            this.$confirm('是否确认删除该用户?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then( async () => {
                try {
                    const result = await this.$http.post('user/delete', {_id: this.usersList[index]['_id']})
                    if( result.errcode === 0 ) {
                        this.$store.dispatch('users/getusers')
                        this.$message({
                            type: 'success',
                            message: '删除成功！'
                        })
                    }
                }catch(err) {
                    this.$message.error('删除失败！');
                }
            })
        },
        resetForm() {
            this.$nextTick(() => {
                this.$refs.form.resetFields();
            })
        }
    }
}

</script>

<style lang="less" scoped>

</style>