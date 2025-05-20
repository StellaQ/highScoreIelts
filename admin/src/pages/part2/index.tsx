import React, { useState } from 'react';
import { Layout, Input, Button, Space, Modal, Form, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, PlusOutlined } from '@ant-design/icons';

interface Category {
  name: string;
  nameCn: string;
  tags: {
    name: string;
    count: number;
    isActive?: boolean;
  }[];
}

interface Topic {
  id: string;
  original: string;
  paraphrase: string;
  chinese: string;
  isActive: boolean;
}

interface Question {
  id: string;
  original: string;
  paraphrase: string;
  chinese: string;
  isActive: boolean;
}

const Part2: React.FC = () => {
  const [categories] = useState<Category[]>([
    {
      name: 'People Description',
      nameCn: '人物描述',
      tags: [
        { name: '性格特征', count: 12, isActive: true },
        { name: '能力才干', count: 10 },
        { name: '外貌穿着', count: 8 },
        { name: '生活习惯', count: 6 },
      ],
    },
    {
      name: 'Object Description',
      nameCn: '物品描述',
      tags: [
        { name: '日常用品', count: 10 },
        { name: '科技产品', count: 8 },
        { name: '艺术作品', count: 6 },
        { name: '纪念物品', count: 7 },
      ],
    },
    {
      name: 'Place Description',
      nameCn: '地点描述',
      tags: [
        { name: '自然景观', count: 9 },
        { name: '建筑场所', count: 11 },
        { name: '公共设施', count: 8 },
        { name: '休闲场所', count: 7 },
      ],
    },
  ]);

  const [topics] = useState<Topic[]>([
    {
      id: 't1',
      original: 'Describe a person you know who enjoys dressing well',
      paraphrase: 'Tell me about someone in your life who has a great sense of fashion',
      chinese: '描述一个你认识的爱好穿着打扮的人',
      isActive: true,
    },
    {
      id: 't2',
      original: 'Describe a place you visited that was affected by pollution',
      paraphrase: 'Tell me about a location you have been to that suffered from environmental issues',
      chinese: '描述一个你去过的受到污染影响的地方',
      isActive: true,
    },
  ]);

  const [questions] = useState<Question[]>([
    {
      id: 'q1',
      original: 'Who is this person that you want to talk about?',
      paraphrase: 'Could you introduce the person you are going to describe?',
      chinese: '你想要谈论的这个人是谁？',
      isActive: true,
    },
    {
      id: 'q2',
      original: 'What job/studies does this person do?',
      paraphrase: 'Could you tell me about their occupation or educational background?',
      chinese: '这个人是做什么工作或学习什么的？',
      isActive: true,
    },
    {
      id: 'q3',
      original: 'What sort of clothes does this person usually wear?',
      paraphrase: 'Could you describe their typical fashion choices and style of dress?',
      chinese: '这个人通常穿什么样的衣服？',
      isActive: true,
    },
  ]);

  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showTopicModal = () => {
    setIsTopicModalVisible(true);
  };

  const showQuestionModal = () => {
    setIsQuestionModalVisible(true);
  };

  const showAIModal = () => {
    setIsAIModalVisible(true);
  };

  return (
    <div className="container">
      {/* 左侧分类列表 */}
      <div className="categories">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Part 2分类列表</h3>
          <Button type="primary" onClick={showAIModal}>AI归类</Button>
        </div>

        <div className="search-box">
          <Input
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            placeholder="搜索分类或标签..."
          />
        </div>

        {categories.map((category, index) => (
          <div key={index} className="category-item">
            <div className="category-name">{category.name}</div>
            <div className="category-name-cn">{category.nameCn}</div>
            <div className="tag-list">
              {category.tags.map((tag, tagIndex) => (
                <div
                  key={tagIndex}
                  className={`tag-item ${tag.isActive ? 'active' : ''}`}
                >
                  <span className="tag">{tag.name}</span>
                  <span className="tag-count">({tag.count})</span>
                  <div className="tag-actions">
                    <EditOutlined className="tag-action-btn" />
                    <ArrowUpOutlined className="tag-action-btn" />
                    <ArrowDownOutlined className="tag-action-btn" />
                    <DeleteOutlined className="tag-action-btn" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 中间话题列表 */}
      <div className="topics">
        <div 
          className="add-button" 
          onClick={showTopicModal}
          style={{ marginBottom: '20px' }}
        >
          <PlusOutlined style={{ marginRight: '8px' }} />
          添加话题
        </div>

        {topics.map((topic, index) => (
          <div 
            key={index} 
            className={`list-item ${!topic.isActive ? 'archived' : ''} ${topic.isActive ? 'active' : ''}`}
          >
            <input type="checkbox" checked={topic.isActive} />
            <span className="drag-handle">⋮</span>
            <div className="list-content">
              <div className="item-original">{topic.original}</div>
              <div className="item-paraphrase">{topic.paraphrase}</div>
              <div className="item-chinese">{topic.chinese}</div>
              <span className="edit-icon">✎</span>
            </div>
          </div>
        ))}
      </div>

      {/* 右侧问题列表 */}
      <div className="questions">
        <div 
          className="add-button" 
          onClick={showQuestionModal}
          style={{ marginBottom: '20px' }}
        >
          <PlusOutlined style={{ marginRight: '8px' }} />
          添加问题
        </div>

        {questions.map((question, index) => (
          <div 
            key={index} 
            className={`list-item ${!question.isActive ? 'archived' : ''}`}
          >
            <input type="checkbox" checked={question.isActive} />
            <span className="drag-handle">⋮</span>
            <div className="list-content">
              <div className="question-text">
                <div className="item-original">{question.original}</div>
                <div className="item-paraphrase">{question.paraphrase}</div>
                <div className="item-chinese">{question.chinese}</div>
              </div>
              <span className="edit-icon">✎</span>
            </div>
          </div>
        ))}
      </div>

      {/* 话题新增模态框 */}
      <Modal
        title="新增话题"
        open={isTopicModalVisible}
        onCancel={() => setIsTopicModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsTopicModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => setIsTopicModalVisible(false)}>
            确认新增
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="原始话题" name="originalTopic">
            <Input placeholder="请输入原始话题（英文）" />
          </Form.Item>
          <Form.Item label="改写话题" name="paraphraseTopic">
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入改写话题（英文）" />
              <Button type="primary">AI生成</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="中文话题" name="chineseTopic">
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入中文话题" />
              <Button type="primary">AI生成</Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      </Modal>

      {/* 问题新增模态框 */}
      <Modal
        title="新增问题"
        open={isQuestionModalVisible}
        onCancel={() => setIsQuestionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsQuestionModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => setIsQuestionModalVisible(false)}>
            确认新增
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="原始问题" name="originalQuestion">
            <Input placeholder="请输入原始问题（英文）" />
          </Form.Item>
          <Form.Item label="改写问题" name="paraphraseQuestion">
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入改写问题（英文）" />
              <Button type="primary">AI生成</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="中文问题" name="chineseQuestion">
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入中文问题" />
              <Button type="primary">AI生成</Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI归类模态框 */}
      <Modal
        title="AI智能归类"
        open={isAIModalVisible}
        onCancel={() => setIsAIModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAIModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => setIsAIModalVisible(false)}>
            AI匹配
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="输入内容">
            <Input.TextArea
              placeholder="请输入Part 2题目内容，例如：&#10;Describe a person you know who enjoys dressing well&#10;Who the person is&#10;What job/studies the person does&#10;What sort of clothes the person wears&#10;And explain why you think this person enjoys dressing well"
              rows={6}
            />
          </Form.Item>
          <div className="ai-suggestion">
            <div className="ai-suggestion-title">AI建议分类</div>
            <p>根据内容分析，建议将该话题归类到：<strong>People（人物类）</strong></p>
            <p>匹配度：<span>95%</span></p>

            <div className="topic-display status-new">
              <div className="item-original">Describe a person you know who enjoys dressing well</div>
              <div className="item-paraphrase">Tell me about someone in your life who has a great sense of fashion</div>
              <div className="item-chinese">描述一个你认识的爱好穿着打扮的人</div>
            </div>

            <div className="question-display status-new">
              <div className="item-original">Who is this person that you want to talk about?</div>
              <div className="item-paraphrase">Could you introduce the person you're going to describe?</div>
              <div className="item-chinese">你想要谈论的这个人是谁？</div>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Part2; 