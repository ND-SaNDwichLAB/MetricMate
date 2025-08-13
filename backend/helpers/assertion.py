def format_output(text):
    # Define the sections we are looking for
    sections = ['observation', 'action', 'new assertion']

    # Split the text into lines
    lines = text.split('\n')

    # Initialize the formatted output
    formatted_output = []
    current_section = None
    new_assertion = None 

    # Iterate through lines and add newlines before section titles
    for index, line in enumerate(lines):
        for section in sections:
            if line.strip().startswith(f'({section})'):
                current_section = section
                formatted_output.append('\n')
            if current_section == 'new assertion':
                new_assertion = lines[index+1]         
                     
        formatted_output.append(line)

    # Join the formatted output into a single string
    formatted_text = '\n'.join(formatted_output).strip()
    
    return (formatted_text, new_assertion)