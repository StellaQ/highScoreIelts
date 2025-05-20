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

const Part1: React.FC = () => {
  const [categories] = useState<Category[]>([
    {
      name: 'Personal Life',
      nameCn: '个人生活',
      tags: [
        { name: '学习工作', count: 8, isActive: true },
        { name: '个人规划', count: 9 },
        { name: '日常习惯', count: 12 },
        { name: '兴趣爱好', count: 10 },
      ],
    },
    {
      name: 'Relationships',
      nameCn: '人际关系',
      tags: [
        { name: '家庭关系', count: 11 },
        { name: '朋友社交', count: 9 },
        { name: '同事关系', count: 8 },
        { name: '邻里互动', count: 7 },
      ],
    },
    // ... 其他分类
  ]);

  const [topics] = useState<Topic[]>([
    {
      id: 't1',
      original: 'Self Introduction',
      paraphrase: 'Personal Background',
      chinese: '自我介绍',
      isActive: true,
    },
    {
      id: 't2',
      original: 'Career Planning',
      paraphrase: 'Future Career Aspirations',
      chinese: '职业规划',
      isActive: true,
    },
    {
      id: 't3',
      original: 'Personal Habits',
      paraphrase: 'Daily Routines and Preferences',
      chinese: '个人习惯',
      isActive: false,
    },
  ]);

  const [questions] = useState<Question[]>([
    {
      id: 'q1',
      original: 'Can you tell me about yourself?',
      paraphrase: 'Could you introduce yourself and share some background information?',
      chinese: '你能介绍一下你自己吗？',
      isActive: true,
    },
    {
      id: 'q2',
      original: 'What are your career goals?',
      paraphrase: 'Could you describe your professional aspirations and future career plans?',
      chinese: '你的职业目标是什么？',
      isActive: true,
    },
    {
      id: 'q3',
      original: 'What kind of person are you?',
      paraphrase: 'How would you describe your personality and character traits?',
      chinese: '你是一个什么样的人？',
      isActive: false,
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', minHeight: '800px' }}>
        {/* 左侧分类列表 */}
        <div style={{ width: '300px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Part 1分类列表</h3>
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
        <div style={{ width: '400px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
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
        <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px' }}>
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
              placeholder="请直接输入话题和子问题内容"
              rows={6}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Part1; 