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
  relatedPart2?: {
    original: string;
    chinese: string;
  };
}

interface Question {
  id: string;
  original: string;
  paraphrase: string;
  chinese: string;
  isActive: boolean;
  type: 'opinion' | 'comparison' | 'reason' | 'solution' | 'prediction';
}

const Part3: React.FC = () => {
  const [categories] = useState<Category[]>([
    {
      name: 'Social Development',
      nameCn: '社会发展',
      tags: [
        { name: '经济发展', count: 12, isActive: true },
        { name: '科技进步', count: 10 },
        { name: '文化变迁', count: 8 },
        { name: '社会治理', count: 9 },
      ],
    },
    {
      name: 'Education Development',
      nameCn: '教育发展',
      tags: [
        { name: '教育改革', count: 11 },
        { name: '学习方式', count: 9 },
        { name: '教育资源', count: 8 },
        { name: '终身学习', count: 7 },
      ],
    },
    {
      name: 'Environmental Protection',
      nameCn: '环境保护',
      tags: [
        { name: '气候变化', count: 10 },
        { name: '资源利用', count: 8 },
        { name: '生态保护', count: 9 },
        { name: '环保行动', count: 7 },
      ],
    },
  ]);

  const [topics] = useState<Topic[]>([
    {
      id: 't1',
      original: 'Communication Impact & Development',
      paraphrase: 'The influence and evolution of communication skills',
      chinese: '沟通能力的影响与发展',
      isActive: true,
      relatedPart2: {
        original: 'Describe a person you know who likes to talk a lot',
        chinese: '描述一个你认识的话很多的人',
      },
    },
    {
      id: 't2',
      original: 'Environmental Awareness & Protection',
      paraphrase: 'Environmental consciousness and conservation efforts',
      chinese: '环保意识与保护措施',
      isActive: true,
      relatedPart2: {
        original: 'Describe a place you visited that was affected by pollution',
        chinese: '描述一个你去过的受到污染影响的地方',
      },
    },
  ]);

  const [questions] = useState<Question[]>([
    {
      id: 'q1',
      original: 'How should parents encourage their children?',
      paraphrase: 'What methods can parents use to motivate and support their children?',
      chinese: '父母应该如何鼓励孩子？',
      isActive: true,
      type: 'solution',
    },
    {
      id: 'q2',
      original: 'Why do some children talk more than other children?',
      paraphrase: 'What factors contribute to differences in children\'s verbal expression?',
      chinese: '为什么有些孩子比其他孩子话多？',
      isActive: true,
      type: 'reason',
    },
    {
      id: 'q3',
      original: 'What are the benefits of being a good communicator?',
      paraphrase: 'How does effective communication skill positively impact one\'s life?',
      chinese: '成为一个好的沟通者有什么好处？',
      isActive: true,
      type: 'opinion',
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

  const getQuestionTypeTag = (type: Question['type']) => {
    const colors = {
      opinion: '#1890ff',
      comparison: '#52c41a',
      reason: '#722ed1',
      solution: '#fa8c16',
      prediction: '#eb2f96',
    };

    return (
      <Tag color={colors[type]} style={{ borderRadius: '10px' }}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Tag>
    );
  };

  return (
    <div className="container">
      {/* 左侧分类列表 */}
      <div className="categories">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Part 3分类列表</h3>
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
              <div className="topic-summary">
                <div className="summary-title">{topic.original}</div>
                <div className="summary-title-cn">{topic.chinese}</div>
                <div className="ai-tag">AI总结</div>
              </div>
              {topic.relatedPart2 && (
                <div className="related-part2">
                  <div className="related-label">关联Part 2话题：</div>
                  <div className="item-original">{topic.relatedPart2.original}</div>
                  <div className="item-chinese">{topic.relatedPart2.chinese}</div>
                </div>
              )}
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
                <div className="question-type">
                  {getQuestionTypeTag(question.type)}
                </div>
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
          <Form.Item label="关联Part 2话题">
            <Button style={{ width: '100%' }}>选择关联话题</Button>
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
          <Form.Item label="问题类型" name="questionType">
            <Space>
              <Button>观点类</Button>
              <Button>对比类</Button>
              <Button>原因类</Button>
              <Button>解决方案类</Button>
              <Button>预测类</Button>
            </Space>
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
              placeholder="请输入Part 3延展问题内容，系统将：&#10;1. 自动生成话题总结标题&#10;2. 识别话题领域&#10;3. 分析问题类型&#10;&#10;例如输入以下问题：&#10;1. How should parents encourage their children?&#10;2. Why do some children talk more than other children?&#10;3. What are the benefits of being a good communicator?&#10;&#10;系统将分析：&#10;1. 话题总结：Communication Impact & Development（沟通能力的影响与发展）&#10;2. 话题领域：People & Relationships（人际关系）&#10;3. 包含问题类型：观点类、原因类、解决方案类"
              rows={6}
            />
          </Form.Item>
          <div className="ai-suggestion">
            <div className="ai-suggestion-title">AI分析结果</div>
            <p>话题总结：<strong>Communication Impact & Development（沟通能力的影响与发展）</strong></p>
            <p>话题领域：<strong>People & Relationships（人际关系）</strong></p>
            <p>问题类型分布：</p>
            <Space style={{ marginTop: '8px' }}>
              {getQuestionTypeTag('opinion')}
              {getQuestionTypeTag('reason')}
              {getQuestionTypeTag('solution')}
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Part3; 