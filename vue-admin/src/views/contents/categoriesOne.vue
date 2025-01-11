<template>
    <!-- 完成 -->
    <!-- 每个季度进行part 1的问题二级归类到一级，也就是数据库里category.tags更新 -->
    <div>
        <div v-for="category in categories" :key="category._id" class="category">
        <!-- 一级标题 -->
        <h1>{{ category.categoryNameInChinese }} ({{ category.categoryName }})</h1>
        <!-- 描述 -->
        <p>{{ category.categoryDescription }}</p>
        <!-- 二级标题 -->
        <div v-for="tag in category.tags" :key="tag._id" class="tag">
            <h2>{{ tag.tagName }}</h2>
        </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
    data () {
        return {
            categories: []
        }
    },
    mounted () {
        this.fetchCategories();
    },
    methods: {
        async fetchCategories() {
            try {
                const result = await axios.get('/api/categories1');
                // console.log(result.data);
                this.categories = result.data;
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        }
    }
}
</script>
<style scoped>
.category {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

h1 {
  font-size: 24px;
  color: #333;
}
p{font-size: 18px;}
h2 {
  font-size: 22px;
  color: #555;
}

.tag {
  margin-left: 20px;
}
</style>
