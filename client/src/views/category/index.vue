<template>
    <content-card button="新建分类" @buttonClick="showAddPop">
        <el-table
        :data="categories"
        style="width: 100%">
            <el-table-column
                prop="category"
                label="分类名称"
                min-width="50%"
                >
            </el-table-column>
            <el-table-column
                label="操作"
                min-width="50%">
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
            <el-input :maxlength="10" :show-word-limit="true" v-model="category" autocomplete="off"></el-input>
            <div slot="footer" class="dialog-footer">
                <el-button @click="isPopshow = false">取 消</el-button>
                <el-button type="primary" @click="saveCategory">确 定</el-button>
            </div>
        </el-dialog>
    </content-card>
</template>

<script>
import ContentCard from '@/components/ContentCard/index'
// import { mapState } from 'vuex'

export default {
    name: 'category',
    components: {
        ContentCard
    },
    data() {
        return {
            popTitle: '新增分类',
            isPopshow: false,
            category: '',
            editCategory: ''
        }
    },
    mounted() {
        this.$store.dispatch('category/getcategories')
    },
    computed: {
        categories() {
            return this.$store.state.category.categories.map( item => {
                return { category: item}
            })
        },
    },
    methods: {
        showAddPop() {
            this.popTitle = '新增分类'
            this.category = this.editCategory = ''
            this.isPopshow = true
        },
        handleEdit(index) {
            this.popTitle = '编辑分类'
            this.category = this.editCategory = this.categories[index].category
            this.isPopshow = true
        },
        handleDelete(index) {
            this.$confirm('是否确认删除该分类?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$http.post('category/delete',{category: this.categories[index].category}).then( res => {
                    if(res.errcode === 0)
                    this.$store.dispatch('category/getcategories')
                    else
                    this.$message.error('删除失败!');
                })
            })
        },
        saveCategory() {
            const [url, data] = this.editCategory ? 
                ['category/edit', {category: this.category, oldCategory: this.editCategory}] 
                : ['category/add', { category: this.category}]
            this.$http.post(url,data).then( res => {
                this.isPopshow = false
                if(res.errcode === 0)
                this.$store.dispatch('category/getcategories')
                else
                this.$message.error('保存失败!');
            })
        }
    }
}

</script>

<style lang="less" scoped>

</style>