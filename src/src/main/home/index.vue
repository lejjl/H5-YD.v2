<template>
  <div>
    <div class="padd">
      <a-button @click="newGroup" type="primary">新建组织</a-button>
    </div>
    <a-table :rowKey="'_id'" bordered :columns="columns" :data-source="listData" class="marg">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex !== 'address'">
          <span>{{ text }}</span>
        </template>
        <template v-if="column.dataIndex == 'address'">
          <a-button type="primary" v-if="record.founderUser.includes(userId)" @click="gotoRoom(record)">进入</a-button>
          <a-button v-else @click="joinRoom(record)">加入组织</a-button>
        </template>
      </template>
    </a-table>
    <!-- 创建组织 -->
    <establish-organization :visible="visible" @handleCancel="handleCancel" @handleOk="handleOk" />
    <!-- 加入 -->
    <join-organization :joinVisible="joinVisible" @handleJoinCancel="handleJoinCancel" @handleJoinOk="handleJoinOk" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue'
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/index'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useCloud } from '@/utils/Hook/useRequest'
import JoinOrganization from './components/joinOrganization.vue'
import EstablishOrganization from './components/establishOrganization.vue'
export default defineComponent({
  components: {
    JoinOrganization,
    EstablishOrganization,
  },
  setup() {
    const store = useAppStore()
    const router = useRouter()
    // 新建组织表单
    const formState = ref({
      name: '',
      disp: '',
      password: '',
      routerCode: '',
    })
    // 表格声明
    const columns = [
      {
        title: '组织名称',
        dataIndex: 'organizeName',
      },
      {
        title: '组织管理员',
        dataIndex: 'founderName',
      },
      {
        title: '路由前缀',
        dataIndex: 'routerCode',
      },
      {
        title: '群组描述',
        dataIndex: 'organizeDisp',
      },
      {
        title: '操作',
        dataIndex: 'address',
      },
    ]
    const listData: Ref<any[]> = ref([]) // 表格数据
    const visible = ref(false) // 新建组织
    const joinVisible = ref(false) // 加入组织

    const joinData = ref({
      // 加入组织密码
      id: '',
      password: '',
    })

    onMounted(() => {
      initTable()
    })

    async function initTable() {
      const groupData = await useCloud('organize').get()
      listData.value = groupData.data
    }
    // 进入房间
    function gotoRoom(data) {
      router.push({
        name: 'pageList',
        query: {
          id: data._id,
        },
      })
    }

    // 加入房间
    async function joinRoom(data) {
      // 输入群组密码
      joinVisible.value = true
      joinData.value = { id: data._id, password: '' }
    }

    function handleJoinCancel() {
      joinVisible.value = false
    }
    // 加入组织
    async function handleJoinOk(value) {
      joinData.value.password = value
      // 改变数据
      let currentData = await useCloud('organize')
        .where({
          _id: joinData.value.id,
          password: joinData.value.password,
        })
        .get()
      console.log(currentData)
      if (currentData.data.length == 1) {
        let { founderUser } = currentData.data[0]
        founderUser.push(store.userData.uid)
        await useCloud('organize')
          .where({
            _id: joinData.value.id,
          })
          .update({
            founderUser: founderUser,
          })
          .then((res) => {
            console.log(res)
            handleJoinCancel()
            initTable()
            message.success('加入成功~')
          })
      } else {
        message.error('密码错误')
      }
    }

    function newGroup() {
      // 打开弹窗
      visible.value = true
    }

    async function handleOk(data) {
      let { name, disp, password, routerCode } = data
      let { uid, email } = store.userData
      await useCloud('organize')
        .add({
          founderName: email,
          founderUser: [uid],
          organizeName: name,
          organizeDisp: disp,
          routerCode: routerCode,
          password,
        })
        .then((res) => {
          console.log(res)
          visible.value = false
          initTable()
        })
      console.log('表单提交')
    }
    function handleCancel() {
      visible.value = false
    }

    return {
      userData: store.userData,
      formState,
      columns,
      listData,
      visible,
      userId: store.userData.uid,
      gotoRoom,
      joinVisible,
      joinData,
      joinRoom,
      handleJoinCancel,
      handleJoinOk,
      newGroup,
      handleOk,
      handleCancel,
      EstablishOrganization,
      JoinOrganization,
    }
  },
})
</script>

<style lang="scss" scoped></style>
