<template>
    <!-- <CButton
        color="primary"
        @click="saveUpdate()"
        >保存更新
    </CButton> -->
    <CCard style="margin-bottom: 10px;"
        v-for="(item, index) in tagList">
        <CCardBody>
            <CCardTitle>{{ item.name }}</CCardTitle>
            <CCardText>
                {{ item.nameInEnglish }}
            </CCardText>
            <CCardText>
                {{ item.alias }}
            </CCardText>
            <!-- <div class="pa-top-right">
                <i class="fi fi-ts-arrow-circle-up mr"
                    v-show="index !== 0"
                    @click="goUp(index)"></i>
                <i class="fi fi-ts-arrow-circle-down mr"
                    v-show="index !== tagList.length - 1"
                    @click="goDown(index)"></i>
                <i class="fi fi-tr-pen-square mr"
                    @click="goEdit(item, index)"></i>
                <i class="fi fi-tr-octagon-xmark mr"
                    @click="goDelete(index)"></i>
                <i class="fi fi-tr-square-plus"
                    @click="addNewOne(index)"></i>
            </div> -->
        </CCardBody>
    </CCard>
    <CModal
        backdrop="static"
        :visible="showModal"
        @close="() => {showModal = false}"
    >
        <CModalHeader 
            dismiss
            @close="() => {showModal = false}"
        >
            <CModalTitle></CModalTitle>
        </CModalHeader>
        <CModalBody>
            <CInputGroup class="mb-3">
              <CInputGroupText id="basic-addon1">名称</CInputGroupText>
              <!-- <CFormInput
                aria-describedby="basic-addon1"
                :value="modalData.name"
              /> -->
              <input type="text"
                v-model="modalData.name">
            </CInputGroup>
            <CInputGroup class="mb-3">
                <CInputGroupText id="basic-addon2">英文名称</CInputGroupText>
                <input type="text"
                v-model="modalData.nameInEnglish">
            </CInputGroup>
            <div class="mb-3">
                        描述：
                        <textarea v-model="modalData.alias"></textarea>
                <!-- <CFormLabel for="exampleFormControlTextarea1"
                  >描述</CFormLabel
                >
                <CFormTextarea
                  id="exampleFormControlTextarea1"
                  rows="3"
                  :model-value="modalData.alias"
                ></CFormTextarea> -->
            </div>        
        </CModalBody>
        <CModalFooter>
            <CButton
                color="secondary"
                @click="() => {showModal = false}"
                >关闭
            </CButton>
            <CButton color="primary"
                @click="saveData()">保存</CButton>
        </CModalFooter>
    </CModal>
</template>
<script>
import axios from 'axios';
export default {
    data () {
        return {
            tagList: [],
            showModal: false,
            modalData: {},
            modalIndex: -1
        }
    },
    mounted () {
        // this.getTags();
    },
    methods: {
        async getTags() {
            try {
                const result = await axios.get('/api/categories1');
                // console.log(result.data);
                this.tagList = result.data;
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        },
        goUp (index) {
            let temp = this.tagList[index];
            this.tagList[index] = this.tagList[index-1];
            this.tagList[index-1] = temp;
        },
        goDown (index) {
            let temp = this.tagList[index];
            this.tagList[index] = this.tagList[index+1];
            this.tagList[index+1] = temp;
        },
        goEdit (item, index) {
            console.log(index);
            this.showModal = true;
            this.modalData = item;
            this.modalIndex = index;
        },
        goDelete (index) {
            this.tagList.splice(index, 1);
        },
        addNewOne (index) {
            console.log(index);
            this.showModal = true;
        },
        saveData () {
            console.log(this.modalData);
            let idx = this.modalIndex;
            this.tagList[idx] = this.modalData;
            this.modalData = {};
            this.modalIndex = -1;
            this.showModal = false;
            console.log(this.tagList[idx]);
        },
        saveUpdate () {
            console.log(this.tagList);
        }
    }
}
</script>
<style>
.pa-top-right{
    display: flex;
    justify-content: right;
    position: absolute;
    top: 20px;
    right: 20px;
}
.mr{
    margin-right: 10px;
}
</style>