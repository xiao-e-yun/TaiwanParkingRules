import React, {useState} from 'react';
import {GetStaticProps} from 'next';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Layout from '@/components/Layout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  Mail,
  MessageSquare,
  HelpCircle,
  UserRoundCog,
  UserRoundPen,
  UserRoundSearch,
  UsersRound
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const {t} = useTranslation(['contact', 'common']);

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact:sections.contact.email'),
      value: t('contact:info.email'),
      href: `mailto:${t('contact:info.email')}`
    }
  ];

  const faqItems = [
    {
      id: 'q1',
      question: t('contact:sections.faq.questions.q1.question'),
      answer: t('contact:sections.faq.questions.q1.answer')
    },
    {
      id: 'q2',
      question: t('contact:sections.faq.questions.q2.question'),
      answer: t('contact:sections.faq.questions.q2.answer')
    },
    {
      id: 'q3',
      question: t('contact:sections.faq.questions.q3.question'),
      answer: t('contact:sections.faq.questions.q3.answer')
    },
    {
      id: 'q4',
      question: t('contact:sections.faq.questions.q4.question'),
      answer: t('contact:sections.faq.questions.q4.answer')
    }
  ];

  return (
    <Layout title={t('contact:title')}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('contact:title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('contact:subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {t('contact:sections.contact.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    const content = (
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-gray-600">{item.value}</div>
                        </div>
                      </div>
                    );

                    return item.href ? (
                      <a key={index} href={item.href} target="_blank" rel="noopener noreferrer">
                        {content}
                      </a>
                    ) : (
                      <div key={index}>{content}</div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  {t('contact:sections.faq.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                        className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{item.question}</span>
                        <div className={`transform transition-transform ${expandedFaq === item.id ? 'rotate-180' : ''
                          }`}>
                          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedFaq === item.id && (
                        <div className="p-4 pt-0 text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About us */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UsersRound className="h-5 w-5 mr-2" />
                  {t('contact:sections.about.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {([
                  ["張瑞賢", UserRoundCog, "xiao-e-yun"],
                  ["林于廷", UserRoundPen, "Yuting7071"],
                  ["楊竣永", UserRoundSearch, "yong7533"]
                ] as const).map(([name, Icon, profile], index) => {
                  return (
                    <a href={`https://github.com/${profile}`} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Icon className="h-8 w-8 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{name}</div>
                        <span className="text-gray-600">@{profile}</span>
                      </div>
                    </a>
                  );
                })}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'contact'])),
    },
  };
};

export default ContactPage;
