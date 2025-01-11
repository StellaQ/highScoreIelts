<template>
  <CFormInput 
    type="file" 
    id="formFile" 
    label="Step 1：上传文档"
    @change="handleFileUpload" />
  <div class="mt30">Step 2：校对内容</div>
  <CAccordion>
    <CAccordionItem 
      v-for="(item, index) in parsedData"
      :key="index"
      :item-key="index">
      <CAccordionHeader>
        {{ index + 1 + ':' }}
        <input 
          style="width:60%;margin-left: 5px;border: 0;"
          v-model="item.tag" 
          type="text">
      </CAccordionHeader>
      <CAccordionBody>
        <CListGroup>
          <CListGroupItem 
            v-for="(question, qIndex) in item.questions"
            :key="qIndex">
              <input
                style="width:100%;border: 0;"
                v-model="item.questions[qIndex]" 
                type="text">
          </CListGroupItem>
        </CListGroup>
      </CAccordionBody>
    </CAccordionItem>
  </CAccordion>
  <div class="mt30 mb10">Step 3：保存更新</div>
  <div class="step3 mb10">
    <CButton color="primary" variant="outline"
    :disabled="disabled"
    @click="saveData">保存</CButton>
  </div>
</template>

<script>
import JSZip from 'jszip';
import axios from 'axios';

export default {
  data() {
    return {
      parsedData: [],
      disabled: false
    };
  },
  mounted () {
    this.getQuestionsForAdmin();
  },
  methods: {
    async getQuestionsForAdmin() {
      try {
          const response = await axios.get('/api/partone/getQuestionsForAdmin');
          this.parsedData = response.data;
      } catch (error) {
          console.error('Error fetching questions:', error);
      }
    },
    saveData() {
      if (this.parsedData.length===0) return; 
      this.disabled = true;
      // console.log(this.parsedData);
      axios.post('/api/partone/saveQuestions', this.parsedData)
        .then(response => {
          this.disabled = false;
          console.log('保存成功', response.data);
        })
        .catch(error => {
          console.error('保存失败', error);
        });
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      
      if (file) {
        try {
          const zip = await JSZip.loadAsync(file);
          const docFile = zip.file("word/document.xml");
          
          if (docFile) {
            const content = await docFile.async("string");
            this.parsedData = this.processDocument(content);

            this.disabled = false;
          }
        } catch (error) {
          console.error("Error reading .docx file:", error);
        }
      }
    },
    // part one的文档格式：
    // 01：Where you live（New） 
    // How long have you lived in the house or apartment you’re living in now? 
    // What do you like about this house or apartment? 
    // What kind of home would you like to live in in the future? 
    // 02：Work and Study（New） 
    // What work do you do? 
    // How easy is it to get this kind of work in your country? 
    // How important is it to you to have work that you enjoy doing? 
    // 文档上传后转成如下格式parsedData
    // [
    //   {
    //       "tag": "Where you live（New）",
    //       "questions": [
    //           "How long have you lived in the house or apartment you’re living in now?",
    //           "What do you like about this house or apartment?",
    //           "What kind of home would you like to live in in the future?"
    //       ]
    //   },
    //   {
    //       "tag": "Work and Study（New）",
    //       "questions": [
    //           "What work do you do?",
    //           "How easy is it to get this kind of work in your country?",
    //           "How important is it to you to have work that you enjoy doing?"
    //       ]
    //   },
    //   {
    //       "tag": "Hometown",
    //       "questions": [
    //           "Do you come from a city, town or village?",
    //           "What do you like about your home city/town/village?",
    //           "Is your home city/town/village a good place for young people?"
    //       ]
    //   }
    // ]
    processDocument(content) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "application/xml");
      const paragraphs = xmlDoc.getElementsByTagName("w:p");

      const parsedData = [];
      let currentTag = '';
      let currentQuestions = [];

      for (let p of paragraphs) {
        let texts = [];
        const textElements = p.getElementsByTagName("w:t");

        for (let t of textElements) {
          texts.push(t.textContent.trim());
        }

        // 将所有的文本片段合并成一行，并去掉多余的空格
        let fullText = texts.join("").trim();

        // 尝试手动修复分离的数字或字母（如 "2 0" -> "20"）
        fullText = fullText.replace(/(\d)\s+(\d)/g, '$1$2');

        if (!fullText) continue;

        const normalizedText = fullText.replace(/\s+/g, ' ').trim();

        if (normalizedText.match(/^\d{1,2}：/)) {
          if (currentTag && currentQuestions.length > 0) {
            parsedData.push({ tag: currentTag, questions: currentQuestions });
          }

          currentTag = normalizedText.replace(/^\d{1,2}：/, '').trim();
          currentQuestions = [];
        } else if (currentTag !== '' && normalizedText) {
          currentQuestions.push(normalizedText);
        }
      }

      if (currentTag && currentQuestions.length > 0) {
        parsedData.push({ tag: currentTag, questions: currentQuestions });
      }

      return parsedData;
    }
  }
};
</script>

<style scoped>
/* 在这里可以添加样式 */
.mt30{
  margin-top: 30px;
}
.mb10{
  margin-bottom: 10px;
}
.step3{
  display: flex;
  flex-direction: row;
  justify-content: right;
}
</style>
