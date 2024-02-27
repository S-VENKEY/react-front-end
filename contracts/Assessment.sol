// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    string public password; // Added password variable

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event PasswordSet(string password); // Event for password setting

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        password = "nithin"; // Initialize password as empty string
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function setPassword(string memory _password) public {
        require(msg.sender == owner, "You are not the owner of this account");
        password = _password;
        emit PasswordSet(_password);
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // Check password
        require(msg.sender == owner && keccak256(abi.encodePacked(password)) == keccak256(abi.encodePacked("nithin")), "Invalid password");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }
    
    // Retirement Planning Calculator function declared as pure
    function calculateRetirement(uint256 retirementAge, uint256 lifeExpectancy, uint256 inflationRate, uint256 monthlyExpenses) public pure returns(uint256 retirementSavingsNeeded) {
        uint256 yearsInRetirement = lifeExpectancy - retirementAge;
        uint256 totalMonthlyExpenses = monthlyExpenses * 12;
        uint256 inflatedMonthlyExpenses = totalMonthlyExpenses * ((inflationRate + 100) ** yearsInRetirement) / 100;
        retirementSavingsNeeded = inflatedMonthlyExpenses * 12 * yearsInRetirement;
    }
}
