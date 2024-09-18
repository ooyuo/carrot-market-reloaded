import FormButton from "@/components/form-btn";
import FormInput from "@/components/form-input";
import React from "react";

function SMSLogin() {
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">SMS Log in</h1>
        <h2 className="text-xl">Verify your phone number.</h2>
      </div>
      <form className="flex flex-col gap-3">
        <FormInput
          name="phone"
          type="number"
          placeholder="Phone number"
          required
          errors={[]}
        />
        <FormInput
          name="code"
          type="number"
          placeholder="Verification code"
          required
          errors={[]}
        />
        <FormButton text="Verify" />
      </form>
    </div>
  );
}

export default SMSLogin;
