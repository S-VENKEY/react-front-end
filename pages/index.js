import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [password, setPassword] = useState("");
  const [retirementData, setRetirementData] = useState({
    retirementAge: 65,
    lifeExpectancy: 85,
    inflationRate: 3,
    monthlyExpenses: 5000, // Example starting value
    retirementSavingsGoal: 0,
  });

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;
  const defaultPassword = "nithin";

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (password !== defaultPassword) {
      alert("Incorrect password. Please try again.");
      return;
    }
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (password !== defaultPassword) {
      alert("Incorrect password. Please try again.");
      return;
    }
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const calculateRetirement = () => {
    const { retirementAge, lifeExpectancy, inflationRate, monthlyExpenses } = retirementData;
    // Formula to calculate retirement savings needed
    const yearsInRetirement = lifeExpectancy - retirementAge;
    const totalMonthlyExpenses = monthlyExpenses * 12;
    const inflatedMonthlyExpenses = totalMonthlyExpenses * Math.pow(1 + inflationRate / 100, yearsInRetirement);
    const retirementSavingsNeeded = inflatedMonthlyExpenses * 12 * yearsInRetirement;

    setRetirementData({ ...retirementData, retirementSavingsGoal: retirementSavingsNeeded });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRetirementData({ ...retirementData, [name]: parseFloat(value) });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <h2>Retirement Planning Calculator</h2>
        <label>
          Desired Retirement Age:
          <input type="number" name="retirementAge" value={retirementData.retirementAge} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Life Expectancy:
          <input type="number" name="lifeExpectancy" value={retirementData.lifeExpectancy} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Inflation Rate (%):
          <input type="number" name="inflationRate" value={retirementData.inflationRate} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Monthly Expenses ($):
          <input type="number" name="monthlyExpenses" value={retirementData.monthlyExpenses} onChange={handleInputChange} />
        </label>
        <br />
        <button onClick={calculateRetirement}>Calculate Retirement</button>
        <p>Retirement Savings Goal: ${retirementData.retirementSavingsGoal}</p>
        <h2>Password Protection</h2>
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
