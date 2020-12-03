<template>
    <content-card :customTitle="customTitle" button="返回列表" @buttonClick="$router.go(-1)">
        <el-form label-position="left" :model="form" label-width="2rem">
            <el-form-item label="标题">
                <el-input v-model="form.title"></el-input>
            </el-form-item>
            <el-form-item label="类别">
                <el-select v-model="form.category" placeholder="请选择" style="margin-right:2rem">
                    <el-option
                    v-for="item in categories"
                    :key="item"
                    :label="item"
                    :value="item">
                    </el-option>
                </el-select>
                <div class="switch-container" v-if="customTitle">
                    <span class="switch-text">是否更新时间</span>
                    <el-switch
                        v-model="form.update">
                    </el-switch>
                </div>
            </el-form-item>
            <el-form-item label="摘要">
                <el-input type="textarea" v-model="form.desc"></el-input>
            </el-form-item>
            <!-- <el-form-item label="正文" label-position="top"> -->
                <mavon-editor ref="editor" v-model="form.content" :toolbars="toolbars" @imgAdd="$imgAdd" @imgDel="$imgDel"></mavon-editor>
            <!-- </el-form-item> -->
        </el-form>
        <el-row class="button-container">
            <el-button type="info" @click="saveArticle(false)">保存</el-button>
            <el-button type="primary" @click="saveArticle(true)">发布</el-button>
        </el-row>
    </content-card>
</template>

<script>
import lrz from 'lrz'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import ContentCard from '@/components/ContentCard/index'
import { toolbars } from "./config";
import { IMG_SIZE } from "@/utils/config";

export default {
    name: 'usersetting',
    components: {
        mavonEditor,
        ContentCard
    },
    data() {
        return {
            content: '',
            toolbars: toolbars,
            customTitle: '',
            id: '',
            form: {
                title: '',
                desc: '',
                content: '',
                category: '',
                update: false
            }
        }
    },
    created() {
        const id = this.$route.params.id
        if(id) {
            this.id = id
            this.customTitle = '编辑文章'
            this.$http.get('article/getarticleinfo', { params: {id} }).then( res => {
                if(res && res.errcode !== 1) {
                    this.form.title = res.title
                    this.form.desc = res.desc
                    this.form.category = res.category
                    this.form.content = res.content
                    this.form.update = true
                }
            })
        }
        this.$store.dispatch('category/getcategories')
    },
    computed: {
        categories() {
            return this.$store.state.category.categories
        },
    },
    methods: {
        async $imgAdd(pos, $file) {
            const isJPG = $file.type === 'image/jpeg' || $file.type === 'image/png';
            if(!isJPG) {
                this.$message.error('只能上传jpg、png格式图片!');
                this.$refs.editor.$refs.toolbar_left.$imgDelByFilename($file.name)
                return
            }
            // 需要限制图片大小
            const zImg = await lrz($file, { fieldName: 'file' })
            if( zImg.fileLen > IMG_SIZE ) {
                this.$message.error('图片过大，请重新选择!');
                // 删除选择的图片
                this.$refs.editor.$refs.toolbar_left.$imgDelByFilename($file.name)
                return
            }
            this.$http.post('article/addimage', zImg.formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then( res => {
                if(res && res.errcode === 0) {
                    this.$refs.editor.$img2Url(pos, res.url);
                } else {
                    this.$message.error('图片上传失败!');
                }
            })
           
        },
        $imgDel($file) {
            // TODO 增加删除七牛云图片接口
            console.log('+++', $file)
            const filePath = $file[0]
            if(/^http/.test(filePath)) {
                this.$http.post('article/delimage', {
                    filename: filePath
                })
            }
        },
        saveArticle(publish) {
            let url = 'article/add'
            let data = {
                ...this.form,
                publish
            }
            if(this.id) {
                data.articleId = this.id
                data.update = this.form.update
                url = 'article/edit'
            }
            this.$http.post(url, data).then( res => {
                if(res.errcode === 0) {
                    this.$router.go(-1)
                } else {
                    this.$message.error('文章保存失败!');
                }
            })
        }
    }
}

</script>

<style lang="less" scoped>
.button-container {
    display: flex;
    justify-content: center;
    margin: 30px 0;
    > button:first-child {
        margin-right: 20px;
    }
}
.switch-container {
    display: inline-block;
    .switch-text {
        margin-right: 0.5rem;
    }
}
</style>