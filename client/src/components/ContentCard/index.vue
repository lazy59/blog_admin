<template>
    <el-card class="layout-card">
        <div slot="header" class="clearfix">
            <span>{{customTitle || title}}</span>
            <el-button v-if="button" style="float: right; padding: 3px 0;" type="text" @click="buttonClick">{{button}}</el-button>
        </div>
        <slot></slot>
    </el-card>
</template>

<script>
    export default {
        name: 'ContentCard',
        props: ['button', 'customTitle'],
        computed: {
            title() {
                return this.$route.name
            }
        },
        methods: {
            buttonClick() {
                this.$emit('buttonClick')
            }
        }
    }
</script>

<style lang="less" scoped>
.layout-card {
    margin: 20px 0;
}
</style>