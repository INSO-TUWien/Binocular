# Clone Binocular repository
echo
echo "Installing Binocular"
echo

mkdir install
cd /install
git clone --single-branch --branch feature/116 https://github.com/INSO-TUWien/Binocular.git
cd Binocular

echo
echo "Installing Dependencies"
echo
npm ci
