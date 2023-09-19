# Clone Binocular repository
echo
echo "Installing Binocular"
echo

# Install arangodb service
apt-get update && apt-get -y install wget
wget -nv https://download.arangodb.com/arangodb311/Community/Linux/arangodb3-linux-3.11.1_x86_64.tar.gz
tar -xf arangodb3-linux-3.11.1_x86_64.tar.gz

mkdir install
cd /install
git clone --single-branch --branch feature/116 https://github.com/INSO-TUWien/Binocular.git
cd Binocular

echo
echo "Installing Dependencies"
echo
npm ci
