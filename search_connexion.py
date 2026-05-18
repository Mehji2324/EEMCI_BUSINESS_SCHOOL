import os

def search_connexion(root_dir):
    for root, dirs, files in os.walk(root_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.html', '.css', '.json')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        if 'Connexion' in f.read():
                            print(f'Found in {path}')
                except:
                    try:
                        with open(path, 'r', encoding='latin-1') as f:
                            if 'Connexion' in f.read():
                                print(f'Found in {path} (latin-1)')
                    except:
                        pass

search_connexion('.')
