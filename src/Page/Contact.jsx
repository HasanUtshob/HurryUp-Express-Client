import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form data:", formData);
    // Handle form submission here
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "general",
    });
  };

  return (
    <div className="min-h-screen bg-base-100 dark:bg-black text-base-content dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-base-content dark:text-white mb-2">
            📞 Contact Us
          </h1>
          <p className="text-base-content/70 dark:text-gray-300">
            Get in touch with our team. We're here to help with all your courier
            needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            <div className="card bg-base-200 dark:bg-gray-800 shadow-lg transition-colors duration-300">
              <div className="card-body">
                <h3 className="card-title text-base-content dark:text-white mb-4">
                  📍 Get in Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">📞</div>
                    <div>
                      <p className="font-semibold text-base-content dark:text-white">
                        Phone
                      </p>
                      <p className="text-base-content/70 dark:text-gray-300">
                        +1 (555) 123-4567
                      </p>
                      <p className="text-sm text-base-content/60 dark:text-gray-400">
                        Mon-Fri 8AM-8PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-xl">📧</div>
                    <div>
                      <p className="font-semibold text-base-content dark:text-white">
                        Email
                      </p>
                      <p className="text-base-content/70 dark:text-gray-300">
                        support@hurryupexpress.com
                      </p>
                      <p className="text-sm text-base-content/60 dark:text-gray-400">
                        24/7 Support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-xl">📍</div>
                    <div>
                      <p className="font-semibold text-base-content dark:text-white">
                        Address
                      </p>
                      <p className="text-base-content/70 dark:text-gray-300">
                        123 Express Lane
                        <br />
                        Courier City, CC 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-xl">💬</div>
                    <div>
                      <p className="font-semibold text-base-content dark:text-white">
                        Live Chat
                      </p>
                      <p className="text-base-content/70 dark:text-gray-300">
                        Available on website
                      </p>
                      <p className="text-sm text-base-content/60 dark:text-gray-400">
                        Mon-Fri 9AM-6PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card bg-base-200 dark:bg-gray-800 shadow-lg transition-colors duration-300">
              <div className="card-body">
                <h3 className="card-title text-base-content dark:text-white mb-4">
                  🕒 Business Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base-content/70 dark:text-gray-300">
                      Monday - Friday
                    </span>
                    <span className="font-semibold text-base-content dark:text-white">
                      8:00 AM - 8:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70 dark:text-gray-300">
                      Saturday
                    </span>
                    <span className="font-semibold text-base-content dark:text-white">
                      9:00 AM - 5:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70 dark:text-gray-300">
                      Sunday
                    </span>
                    <span className="font-semibold text-base-content dark:text-white">
                      10:00 AM - 4:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card bg-error/10 dark:bg-error/20 border border-error/20 dark:border-error/30 shadow-lg transition-colors duration-300">
              <div className="card-body">
                <h3 className="card-title text-error dark:text-error-content mb-2">
                  🚨 Emergency Support
                </h3>
                <p className="text-sm text-base-content/70 dark:text-gray-300 mb-3">
                  For urgent delivery issues or lost packages
                </p>
                <p className="font-bold text-error dark:text-error-content text-lg">
                  +1 (555) 911-RUSH
                </p>
                <p className="text-xs text-base-content/60 dark:text-gray-400">
                  Available 24/7
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="card bg-base-200 dark:bg-gray-800 shadow-lg transition-colors duration-300"
            >
              <div className="card-body">
                <h3 className="card-title text-base-content dark:text-white mb-6">
                  📝 Send us a Message
                </h3>

                {/* Inquiry Type */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text text-base-content dark:text-gray-300">
                      Inquiry Type
                    </span>
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="select select-bordered bg-base-100 dark:bg-gray-700 text-base-content dark:text-white border-base-300 dark:border-gray-600"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="tracking">Package Tracking</option>
                    <option value="complaint">Complaint</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content dark:text-gray-300">
                        Full Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input input-bordered bg-base-100 dark:bg-gray-700 text-base-content dark:text-white border-base-300 dark:border-gray-600"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content dark:text-gray-300">
                        Email Address *
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input input-bordered bg-base-100 dark:bg-gray-700 text-base-content dark:text-white border-base-300 dark:border-gray-600"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content dark:text-gray-300">
                        Phone Number
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input input-bordered bg-base-100 dark:bg-gray-700 text-base-content dark:text-white border-base-300 dark:border-gray-600"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content dark:text-gray-300">
                        Subject *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="input input-bordered bg-base-100 dark:bg-gray-700 text-base-content dark:text-white border-base-300 dark:border-gray-600"
                      placeholder="Brief subject of your inquiry"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text text-base-content dark:text-gray-300">
                      Message *
                    </span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-32 bg-base-100 dark:bg-gray-700 text-base-content dark:text-white border-base-300 dark:border-gray-600"
                    placeholder="Please provide details about your inquiry..."
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary btn-lg">
                    📤 Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="card bg-base-200 dark:bg-gray-800 shadow-lg transition-colors duration-300">
            <div className="card-body">
              <h3 className="card-title text-base-content dark:text-white mb-6">
                ❓ Frequently Asked Questions
              </h3>

              <div className="space-y-4">
                <div className="collapse collapse-arrow bg-base-100 dark:bg-gray-700 transition-colors duration-300">
                  <input type="radio" name="faq-accordion" defaultChecked />
                  <div className="collapse-title text-lg font-medium text-base-content dark:text-white">
                    How can I track my package?
                  </div>
                  <div className="collapse-content text-base-content/70 dark:text-gray-300">
                    <p>
                      You can track your package using the tracking number
                      provided in your confirmation email. Simply enter it on
                      our Track Order page or call our customer service.
                    </p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-base-100 dark:bg-gray-700 transition-colors duration-300">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium text-base-content dark:text-white">
                    What are your delivery timeframes?
                  </div>
                  <div className="collapse-content text-base-content/70 dark:text-gray-300">
                    <p>
                      We offer Standard (2-3 days), Express (next day), Same Day
                      (4-6 hours), and International (5-10 days) delivery
                      options.
                    </p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-base-100 dark:bg-gray-700 transition-colors duration-300">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium text-base-content dark:text-white">
                    How do I file a claim for a lost package?
                  </div>
                  <div className="collapse-content text-base-content/70 dark:text-gray-300">
                    <p>
                      Contact our customer service immediately with your
                      tracking number. We'll investigate and process your claim
                      within 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className="collapse collapse-arrow bg-base-100 dark:bg-gray-700 transition-colors duration-300">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium text-base-content dark:text-white">
                    Do you offer insurance for packages?
                  </div>
                  <div className="collapse-content text-base-content/70 dark:text-gray-300">
                    <p>
                      Yes, we offer package insurance up to $5,000. Insurance
                      rates vary based on package value and destination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
