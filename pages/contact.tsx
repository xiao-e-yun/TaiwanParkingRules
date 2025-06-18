import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { ContactFormSchema, type ContactFormInput } from '@/lib/schemas';

const ContactPage: React.FC = () => {
  const { t } = useTranslation(['contact', 'common']);
  
  const [formData, setFormData] = useState<ContactFormInput>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string,string>>({});
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = ContactFormSchema.safeParse(formData);

      if (!validatedData.success) {
        setFormErrors(Object.fromEntries(validatedData.error.errors.map(err => [err.path,err.message])));
        console.error('Form validation errors:', validatedData.error.errors);
        return
      }

      setSubmitStatus('sending');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form and show success
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitStatus('sent');
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleInputChange = (field: keyof ContactFormInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact:sections.contact.email'),
      value: t('contact:info.email'),
      href: `mailto:${t('contact:info.email')}`
    },
    {
      icon: Phone,
      label: t('contact:sections.contact.phone'),
      value: t('contact:info.phone'),
      href: `tel:${t('contact:info.phone')}`
    },
    {
      icon: MapPin,
      label: t('contact:sections.contact.address'),
      value: t('contact:info.address'),
      href: `https://maps.google.com/?q=${encodeURIComponent(t('contact:info.address'))}`
    },
    {
      icon: Clock,
      label: t('contact:sections.contact.hours'),
      value: t('contact:info.hours'),
      href: null
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

  const error = (error?: string)=> {
    if (error) return (<Alert variant="destructive" className="mt-2">
        <AlertTitle>{t('contact:messages.validationError')}</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>)
};

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

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  {t('contact:sections.form.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact:sections.form.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      placeholder={t('contact:sections.form.namePlaceholder')}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    { error(formErrors.name) }
                      
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact:sections.form.email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      placeholder={t('contact:sections.form.emailPlaceholder')}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    { error(formErrors.email) }
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact:sections.form.subject')}
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange('subject')}
                      placeholder={t('contact:sections.form.subjectPlaceholder')}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    { error(formErrors.subject) }
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact:sections.form.message')}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      placeholder={t('contact:sections.form.messagePlaceholder')}
                      required
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    { error(formErrors.message) }
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitStatus === 'sending'}
                  >
                    {submitStatus === 'sending' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('contact:sections.form.submit')}...
                      </>
                    ) : submitStatus === 'sent' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('contact:messages.success')}
                      </>
                    ) : submitStatus === 'error' ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {t('contact:messages.error')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('contact:sections.form.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

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
                      <div className={`transform transition-transform ${
                        expandedFaq === item.id ? 'rotate-180' : ''
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
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'contact'])),
    },
  };
};

export default ContactPage;
