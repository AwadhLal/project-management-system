import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send employee approval notification
export const sendEmployeeApprovalEmail = async (employee, company, isApproved) => {
  try {
    const transporter = createTransporter();
    
    const subject = isApproved 
      ? `Welcome to ${company.name}! Your account has been approved`
      : `Account Registration Update - ${company.name}`;

    const html = isApproved ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to ${company.name}!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${employee.name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Great news! Your account has been approved by the company administrator. 
            You can now access all project management features and collaborate with your team.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Account Details:</h3>
            <p><strong>Company:</strong> ${company.name}</p>
            <p><strong>Company Code:</strong> ${company.companyCode}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
            <p><strong>Department:</strong> ${employee.department}</p>
            ${employee.position ? `<p><strong>Position:</strong> ${employee.position}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            You can now:
          </p>
          <ul style="color: #666;">
            <li>View and participate in company projects</li>
            <li>Collaborate with team members</li>
            <li>Track tasks and deadlines</li>
            <li>Access company resources</li>
          </ul>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please contact your administrator or reply to this email.
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            The ${company.name} Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from ${company.name} Project Management System.</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Account Registration Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${employee.name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We regret to inform you that your account registration for ${company.name} 
            has not been approved at this time.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            If you believe this is an error or would like more information, 
            please contact your company administrator.
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            The ${company.name} Team
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${company.name}" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${employee.email}`);
    
  } catch (error) {
    console.error("Send approval email error:", error);
    throw error;
  }
};

// Send project assignment notification
export const sendProjectAssignmentEmail = async (employee, project, company) => {
  try {
    const transporter = createTransporter();
    
    const subject = `New Project Assignment: ${project.name}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Project Assignment</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${employee.name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have been assigned to a new project! Here are the details:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">${project.name}</h3>
            ${project.description ? `<p style="color: #666;">${project.description}</p>` : ''}
            
            <div style="margin-top: 15px;">
              <p><strong>Priority:</strong> <span style="color: ${project.priority === 'HIGH' ? '#dc3545' : project.priority === 'MEDIUM' ? '#ffc107' : '#28a745'}">${project.priority}</span></p>
              <p><strong>Status:</strong> ${project.status}</p>
              ${project.start_date ? `<p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleDateString()}</p>` : ''}
              ${project.end_date ? `<p><strong>End Date:</strong> ${new Date(project.end_date).toLocaleDateString()}</p>` : ''}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/projects" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Project
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please log in to your dashboard to view more details, collaborate with your team, and track your progress.
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            The ${company.name} Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from ${company.name} Project Management System.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${company.name}" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Project assignment email sent to ${employee.email}`);
    
  } catch (error) {
    console.error("Send project assignment email error:", error);
    throw error;
  }
};

// Send task assignment notification
export const sendTaskAssignmentEmail = async (employee, task, project, company) => {
  try {
    const transporter = createTransporter();
    
    const subject = `New Task Assignment: ${task.title}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Task Assignment</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${employee.name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have been assigned a new task in project <strong>${project.name}</strong>:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
            <h3 style="color: #333; margin-top: 0;">${task.title}</h3>
            ${task.description ? `<p style="color: #666;">${task.description}</p>` : ''}
            
            <div style="margin-top: 15px;">
              <p><strong>Priority:</strong> <span style="color: ${task.priority === 'HIGH' ? '#dc3545' : task.priority === 'MEDIUM' ? '#ffc107' : '#28a745'}">${task.priority}</span></p>
              <p><strong>Status:</strong> ${task.status}</p>
              ${task.due_date ? `<p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>` : ''}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/taskDetails?id=${task.id}" 
               style="background: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Task
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please log in to your dashboard to view task details and update your progress.
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            The ${company.name} Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated message from ${company.name} Project Management System.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${company.name}" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Task assignment email sent to ${employee.email}`);
    
  } catch (error) {
    console.error("Send task assignment email error:", error);
    throw error;
  }
};

// Send company invitation email
export const sendCompanyInvitationEmail = async (email, company, inviteToken) => {
  try {
    const transporter = createTransporter();
    
    const subject = `Invitation to join ${company.name}`;
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/employee-signup?token=${inviteToken}&company=${company.companyCode}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #007bff 0%, #6610f2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">You're Invited!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Join ${company.name}</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have been invited to join <strong>${company.name}</strong> on our project management platform.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Company Details:</h3>
            <p><strong>Company:</strong> ${company.name}</p>
            <p><strong>Company Code:</strong> ${company.companyCode}</p>
            <p><strong>Domain:</strong> ${company.domain}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Click the button above to create your account and join the team. 
            You'll be able to collaborate on projects, track tasks, and stay connected with your colleagues.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Note:</strong> This invitation link will expire in 7 days. 
            If you don't have an account, you'll be guided through the registration process.
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            The ${company.name} Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>This is an automated invitation from ${company.name} Project Management System.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${company.name}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Company invitation email sent to ${email}`);
    
  } catch (error) {
    console.error("Send company invitation email error:", error);
    throw error;
  }
};