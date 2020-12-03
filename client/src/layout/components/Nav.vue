<template>
    <Layout>
        <el-menu
        class="el-menu-demo"
        :default-active="activeIndex"
        mode="horizontal"
        @select="handleSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
            <NavItem v-for="(route, index) in showRoutes" :key="index" :route="route" :index="index" />
            <li class="logout" @click="logout">退出登录</li>
        </el-menu>
    </Layout>
</template>

<script>
    import NavItem from './NavItem'
    import Layout from '@/components/Layout/index'

    export default {
        data() {
            return {
                activeIndex: '/usersettings',
            };
        },
        components: {
            NavItem,
            Layout
        },
        mounted() {
            this.activeIndex = this.$route.path
        },
        computed: {
            routes() {
                return this.$router.options.routes
            },
            userinfo() {
                return this.$store.state.users.userinfo
            },
            roleName() {
                return ['editor', 'admin'][this.userinfo.role-1]
            },
            showRoutes() {
                let routes = this.routes.filter( item => {
                    return this.showNav(item)
                })
                routes.forEach( item => {
                    if( item.children ) {
                        item.children = item.children.filter( route => {
                            return this.showNav(route)
                        })
                    }
                })
                routes = routes.filter( item => {
                    return !item.children || item.children.length > 0
                })
                return routes
            }
        },
        methods: {
            showNav(item) {
                return !item.meta || !item.meta.hidden && (!item.meta.roles || item.meta.roles.indexOf(this.roleName) >= 0)
            },
            handleSelect(key) {
                if(key !== this.$route.path)
                this.$router.push(key)
            },
            logout() {
                window.localStorage.removeItem('author_token')
                this.$router.replace('/login')
                window.location.reload()
            }
        }
    }
</script>

<style lang="less" scoped>
#nav {
   background-color: #545c64; 
}
.logout {
    color: #fff;
    font-size: 14px;
    position: absolute;
    right: 0;
    top: 0;
    line-height: 60px;
    cursor: pointer;
    padding: 0 20px;
    &:hover {
        color: rgb(255, 208, 75);
    }
}
</style>