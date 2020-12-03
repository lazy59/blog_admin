<template>
    <content-card button="新增文章" @buttonClick="addArticle">
        <el-table ref="filterTable" :data="articles" style="width: 100%">
            <el-table-column prop="time" label="创建时间" sortable width="180" column-key="time"></el-table-column>
            <el-table-column prop="title" label="标题" width="180"></el-table-column>
            <el-table-column prop="desc" label="摘要"></el-table-column>
            <el-table-column prop="publish" label="状态"
                :filters="[{ text: '已发布', value: '已发布' }, { text: '未发布', value: '未发布' }]"
                :filter-method="filterStatus"
                filter-placement="bottom-end"
            ></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button
                    size="mini"
                    @click="handleEdit(scope.row._id)">编辑</el-button>
                    <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.row._id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            hide-on-single-page
            layout="prev, pager, jumper, next"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="pageChange"
            :style="{textAlign: 'center', marginTop: '20px'}">
        </el-pagination>
    </content-card>
</template>

<script>
import ContentCard from "@/components/ContentCard/index";
import { formatTime } from "../../utils/tools";

export default {
    name: 'articles',
    components: {
        ContentCard
    },
    created() {
        this.getArticles(this.currentPage-1)
    },
    computed: {
        articles() {
            let artilces = this.$store.state.articles.articles.map( item => {
                let data = Object.assign({}, item)
                data.time = formatTime(data.time, "Y/M/D h:m:s")
                data.publish = data.publish ? '已发布' : '未发布'
                return data
            })
            return artilces;
        },
        total() {
            return this.$store.state.articles.total
        },
        currentPage() {
            return this.$store.state.articles.currentPage
        },
        pageSize() {
            return this.$store.state.articles.pageSize
        }
    },
    methods: {
        getArticles(page) {
            this.$store.dispatch("articles/getarticles", page)
        },
        handleEdit(_id) {
            this.$router.push(`/addArticle/${_id}`)
        },
        handleDelete(_id) {
            this.$store.dispatch('articles/deleteOwnerArticle', _id).then( res => {
                if(res.errcode === 0) {
                    this.$message({
                        type: 'success',
                        message: '删除成功！'
                    })
                }else{
                this.$message.error('删除失败!');
                }
            })
        },
        addArticle() {
            this.$router.push('/addArticle')
        },
        filterStatus(value, row) {
            return row.publish === value
        },
        pageChange(page) {
            this.getArticles(page - 1)
        }
    }
}

</script>

<style lang="less" scoped>

</style>